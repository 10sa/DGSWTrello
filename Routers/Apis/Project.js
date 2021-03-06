﻿
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

router.post("/deleteProject", function (request, response, next) {
	var requestProjectId = request.body.projectId;
	dbConnection.query("DELETE FROM projects WHERE projectId = ?", requestProjectId, function (error, result) {
		if (error)
			response.json({ success: false });
		else {
			dbConnection.query("DELETE FROM projectUsers WHERE projectId = ?", requestProjectId);
			response.json({ success: true });
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

router.post("/updateProject", function (request, response, next) {
	var project = JSON.parse(request.body.project);
	dbConnection.query("UPDATE projects SET projectName = ?, projectDesc = ?, projectJson = ? WHERE projectId = ?", [project.projectName, project.projectDesc, JSON.stringify(project.projectJson), project.projectId], function (error, result) {
		if (error)
			response.json({ success: false });
		else
			response.json({ success: true });
	});
});

router.post("/getProjectUsers", function (request, response, next) {
	var requestProjectId = request.body.projectId;
	dbConnection.query("SELECT * FROM projectUsers WHERE projectId = ?", requestProjectId, function (error, result) {
		if (error)
			response.json({ success: false });
		else
			response.json({ success: true, users: result });
	});
});

router.post("/inviteUserToProject", function (request, response, next) {
	var target = request.body.userId;
	var projectId = request.body.projectId;

	dbConnection.query("INSERT projectUsers VALUES (?, ?)", [target, projectId], function (error, result) {
		if (error)
			response.json({ success: false });
		else
			response.json({ success: true });
	});
});

router.post("/removeProjectUser", function (request, response, done) {
	var userId = request.body.userId;
	var projectId = request.body.projectId;

	dbConnection.query("DELETE FROM projectUsers WHERE userId = ? and projectId = ?", [userId, projectId], function (error, result) {
		if (error)
			response.json({ success: false });
		else {
			response.json({ success: true });
		}
	});
});

module.exports = router;