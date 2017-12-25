var express = require("express");
var router = express.Router();

var passport = require("passport");

router.get("/js/*", function (request, response, next) {
	response.sendFile(pagePath + "/js/" + request.params[0]);
});

router.get("/css/*", function (request, response, next) {
	response.sendFile(pagePath + "/css/" + request.params[0]);
});

router.get("/resources/*", function (request, response, next) {
	response.sendFile(pagePath + "/resources/" + request.params[0]);
});

router.get("/login", function (request, response, next) {
	response.sendFile(pagePath + "Login.html");
});

router.get("/projects", function (request, response, next) {
	if (request.isAuthenticated())
		response.sendFile(pagePath + "projectmanage.html");
	else
		response.redirect("/");
});

router.get("/signup", function (request, response, next) {
	response.sendFile(pagePath + "Signup.html");
});

router.get("/forgotidpw", function (request, response, next) {
	response.sendFile(pagePath + "ForgotIDPW.html");
});

router.get("/findid", function (request, response, next) {
	response.sendFile(pagePath + "FindId.html");
});

router.get("/findpw", function (request, response, next) {
	response.sendFile(pagePath + "Findpw.html");
});

router.get("/*", function (request, response, next) {
	if (request.isAuthenticated())
		response.sendFile(pagePath + request.params[0]);
	else
		response.redirect("/");
});

module.exports = router;
