var express = require("express");
var router = express.Router();

var mysql = require("mysql");
var dbConnection = require("../../Database/dbConnector.js")().getConnection();


router.get("/keyboard", function (request, response) {
	console.log("Kakaobot Receive Keyboard Request.")
	response.send(JSON.stringify({
		"type": "text"
	}));
})

router.post("/message", function (request, response) {
	var data = request.body;
	dbConnection.query("SELECT * FROM kakaotalkSession WHERE userId = ?", data.user_key, function (error, result) {
		if (error) {
			response.send(JSON.stringify({
				"message": {
					"text": "DB ERROR!"
				}
			}));
		}
		else {
			if (result.length <= 0) {
				dbConnection.query("INSERT kakaotalkSession VALUES (?, ?, '{}', -1)", [data.user_key, "idle"]);

				result[0] = {
					userId: data.user_key, talkStatus: "idle", sessionJson: {}, authUserId: -1
				};
			}
			
			if (result[0].talkStatus == "tryLogin_ID") {
				var requestId = data.content;
				dbConnection.query("UPDATE kakaotalkSession SET sessionJson = ?, talkStatus = ? WHERE userId = ?", [JSON.stringify({ request_id: requestId }), "tryLogin_PW", data.user_key]);

				response.send(JSON.stringify({
					"message": {
						"text": "PW를 입력해 주세요."
					}
				}));
			}
			else if (result[0].talkStatus == "tryLogin_PW") {
				var jsonData = JSON.parse(result[0].sessionJson);

				dbConnection.query("SELECT * FROM users WHERE id = ? and password = ?", [jsonData.request_id, data.content], function (error, result) {
					if (error) {
						response.send(JSON.stringify({
							"message": {
								"text": "DB ERROR!"
							}
						}));
					}
					else {
						if (result.length <= 0) {
							dbConnection.query("UPDATE kakaotalkSession SET talkStatus = ? WHERE userId = ?", ["idle", data.user_key]);

							response.send(JSON.stringify({
								"message": {
									"text": "등록되지 않은 계정입니다."
								}
							}));
						}
						else {
							dbConnection.query("UPDATE kakaotalkSession SET talkStatus = ?, authUserId = ? WHERE userId = ?", ["idle", result[0].userId, data.user_key]);
							response.send(JSON.stringify({
								"message": {
									"text": "로그인 완료!"
								}
							}));
						}
					}
				});
			}
			else if (result[0].talkStatus == "registerProject") {
				var projectName = data.content;
				dbConnection.query("UPDATE kakaotalkSession SET sessionJson = ?, talkStatus = ? WHERE userId = ?", [JSON.stringify({ request_projectName: projectName }), "registerProject2", data.user_key]);

				response.send(JSON.stringify({
					"message": {
						"text": "프로젝트 설명을 입력해 주세요."
					}
				}));
			}
			else if (result[0].talkStatus == "registerProject2") {
				var projectDesc = data.content;
				var projectJson = JSON.parse(result[0].sessionJson);

				projectJson.request_projectDesc = projectDesc;
				dbConnection.query("UPDATE kakaotalkSession SET sessionJson = ?, talkStatus = ? WHERE userId = ?", [JSON.stringify(projectJson), "registerProject3", data.user_key]);
				response.send(JSON.stringify({
					"message": {
						"text": "프로젝트 마감 기한을 입력해 주세요."
					}
				}));
			}
			else if (result[0].talkStatus == "registerProject3") {
				var projectDeadline = data.content;
				var projectJson = JSON.parse(result[0].sessionJson);
				var userId = result[0].authUserId;

				dbConnection.query("UPDATE kakaotalkSession SET talkStatus = ? WHERE userId = ?", ["idle", data.user_key]);
				dbConnection.query("INSERT projects VALUES (?, ?, ?, ?, 0)", [projectJson.request_projectName, projectJson.request_projectDesc, userId, JSON.stringify({ deadline: projectDeadline })], function (error, result) {
					if (error)
						response.send(JSON.stringify({
							"message": {
								"text": "DB ERROR"
							}
						}));
					else {
						dbConnection.query("SELECT * FROM projects WHERE projectName = ? and projectDesc = ? and creator = ? and projectJson = ?", [projectJson.request_projectName, projectJson.request_projectDesc, userId, JSON.stringify({ deadline: projectDeadline })], function (error, result) {
							dbConnection.query("INSERT projectUsers VALUES (?, ?)", [userId, result[result.length - 1].projectId]);

							response.send(JSON.stringify({
								"message": {
									"text": "성공적으로 프로젝트를 등록했습니다, 사이트에서 확인해 주세요!"
								},
								"message_button": {
									"label": "사이트로 이동하기",
									"url": "http://http://118.219.32.127"
								}
							}));
						});
					}
				});
			}
			else {
				if (data.content == "로그인") {
					dbConnection.query("UPDATE kakaotalkSession SET talkStatus = ? WHERE userId = ?", ["tryLogin_ID", data.user_key]);
					response.send(JSON.stringify({
						"message": {
							"text": "ID를 입력해 주세요."
						}
					}));
				}
				else if (data.content == "프로젝트 등록") {
					if (result[0].authUserId != -1) {
						dbConnection.query("UPDATE kakaotalkSession SET talkStatus = ? WHERE userId = ?", ["registerProject", data.user_key]);
						response.send(JSON.stringify({
							"message": {
								"text": "등록할 프로젝트의 이름을 입력해 주세요."
							}
						}));
					}
					else {
						response.send(JSON.stringify({
							"message": {
								"text": "이 기능을 사용하려면 로그인해야 합니다!"
							}
						}));
					}
				}
				else if (data.content == "로그아웃") {
					dbConnection.query("UPDATE kakaotalkSession SET authUserId = -1 WHERE userId = ?", data.user_key);
					response.send(JSON.stringify({
						"message": {
							"text": "로그아웃 되었습니다."
						}
					}));
				}
				else if (data.content == "상태") {
					if (result[0].authUserId != -1) {
						response.send(JSON.stringify({
							"message": {
								"text": "현재 " + result[0].authUserId + " UserID로 로그인 되어 있습니다."
							}
						}));
					}
					else {
						response.send(JSON.stringify({
							"message": {
								"text": "로그인 되어 있지 않습니다."
							}
						}));
					}
				}
				else {
					response.send(JSON.stringify({
						"message": {
							"text": "명령어\n 로그인 : 계정과 비밀번호를 이용하여 로그인합니다.\n 로그아웃 : 로그아웃합니다. \n 프로젝트 등록: 로그인된 계정에 프로젝트를 등록합니다.\n 상태 : 현재 로그인 되어있는지 확인합니다."
						}
					}));
				}
			}
		}
	});
});

module.exports = router;