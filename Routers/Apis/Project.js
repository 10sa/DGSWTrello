
var express = require("express");
var router = express.Router();

var mysql = require("mysql");
var dbConnection = require("../../Database/dbConnector.js")().getConnection();

router.post("/createProject", function (request, response, next) {
	var projectName = request.body.name;
	var projectDesc = request.body.desc;
	var creator = request.user.userId;
	var projectJson = request.body.json;

	dbConnection.query("INSERT projects VALUES (?, ?, ?, ?, 0)", [projectName, projectDesc, creator, projectJson], function (error, result) {
		if (error)
			response.json({ success: false });
		else {
			dbConnection.query("SELECT * FROM projects WHERE projectName = ? and projectDesc = ? and creator = ? and projectJson = ?", [projectName, projectDesc, creator, projectJson], function (error, result) {
				dbConnection.query("INSERT projectUsers VALUES (?, ?)", [request.user.userId, result[result.length - 1].projectId]);
				response.json({ success: true });
			});
		}
	});
});

router.post("/getProjects", function (request, response, next) {
	dbConnection.query("SELECT * FROM projectUsers WHERE userId = ?", request.user.userId, function (error, result) {
		if (error || result.length <= 0)
			response.json({ success: false, projects: [] });
		else
			response.json({ success: true, projects: result });
	});
});

router.post("/getProject", function (request, response, next) {
	var requestProjectId = request.body.projectId;
	dbConnection.query("SELECT * FROM projects WHERE projectId = ?", requestProjectId, function (error, result) {
		if (error || result.length <= 0)
			response.json({ success: false });
		else
			response.json(Object.assign({}, { success: true, }, result[0]));
	});
});

router.post("/getProjectUsers", function (request, response, next) {
	var reqeustProjectId = requset.body.projectId;
	dbConnection.query("SELECT * FROM projectUsers WHERE userId = ?", requestProjectId, function (error, result) {
		if (error)
			response.json({ success: false });
		else
			response.json({ success: true, users: result });
	});
});

router.post("/inviteUserToProject", function (request, response, next) {
	var target = request.body.targetId;
	var projectId = requset.body.targetId;

	dbConnection.query("INSERT projectUsers VALUES (?, ?)", [target, projectId], function (error, result) {
		if (error)
			response.json({ success: false });
		else
			response.json({ success: true });
	});
});

module.exports = router;