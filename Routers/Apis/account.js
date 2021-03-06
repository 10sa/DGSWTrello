﻿var express = require("express");
var router = express.Router();
var passport = require("passport");

var mysql = require("mysql");
var dbConnection = require("../../Database/dbConnector.js")().getConnection();

router.post("/getAccountInfo", function (request, response, next) {
	if (request.isAuthenticated()) {
		dbConnection.query("SELECT * FROM users WHERE userId = ?", request.user.userId, function (error, result) {
			if (error || result.length <= 0)
				response.json({ success: false });
			else {
				var userInfo = result[0];
				response.json({success:true, id: userInfo.id, password: userInfo.password, email: userInfo.email, nickname: userInfo.nickname, userId: userInfo.userId });
			}
		});
	}
});

router.post("/login", function (request, response) {
	passport.authenticate("login", function (error, user) {
		if (error || user == false)
			return response.json({ success: false });
		else {
			request.login(user, function (error) {
				request.session.save(function () {
					return response.json({ success: true });
				});
			});
		}
	})(request, response);
});

router.get("/login/kakao", passport.authorize("kakao"));

router.get("/login/github", passport.authorize("github"));

router.get("/login/google", passport.authorize("google", {
	scope: [ 'profile']
}));

router.get("/login/kakao/callback", passport.authenticate("kakao", {
	successRedirect: "/",
	failureRedirect: "/Pages/login"
}));

router.get("/login/github/callback", passport.authenticate("github", {
	successRedirect: "/",
	failureRedirect: "/Pages/login"
}));

router.get("/login/google/callback", passport.authenticate("google", {
	successRedirect: "/",
	failureRedirect: "/Pages/login"
}));

router.post("/logout", function (request, response) {
	request.logout();
	request.session.save(function () { response.redirect("../"); })
});

router.post("/signup", function (request, response) {
	var id = request.body.id;
	var password = request.body.password;
	var email = request.body.email;
	var nickname = request.body.nickname;

	dbConnection.query("SELECT * FROM users WHERE email = ?", email, function (error, result) {
		if (error || result.length > 0)
			response.json({ success: false, error: "이미 해당 이메일로 계정이 생성되어 있습니다!" });
		else {
			dbConnection.query("INSERT users VALUES (?, ?, ?, ?, null, 0);", [id, password, email, nickname], function (error, result) {
				if (error)
					response.json({ success: false });
				else
					response.json({ success: true });
			});
		}
	});
});

router.post("/findid", function (request, response) {
	var requestEmail = request.body.email;
	dbConnection.query("SELECT * FROM users WHERE email = ?", requestEmail, function (error, result) {
		if (error)
			response.json({ success: false });
		else {
			var data = [];
			for (var i = 0; i < result.length; i++) {
				if (!result[i].thirdPartyId)
					data[i] = result[i].id;
			}

			response.json({ success: true, data });
		}
	});
});

router.post("/changePw", function (request, response) {
	var id = request.body.id;
	var password = request.body.password;
	var email = request.body.email;

	dbConnection.query("UPDATE users SET password = ? WHERE id = ? and email = ?", [password, id, email], function (error, result) {
		if (error || result.changedRows <= 0)
			response.json({ success: false });
		else
			response.json({ success: true });
	});
});

router.post("/getNicknameById", function (request, response) {
	var userId = request.body.userId;
	dbConnection.query("SELECT * FROM users WHERE userId = ?", userId, function (error, result) {
		if (error)
			response.json({ success: false });
		else
			response.json({ success: true, nickname: result[0].nickname });
	});
});

module.exports = router;