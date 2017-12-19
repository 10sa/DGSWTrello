var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var kakaoStratgey = require("passport-kakao").Strategy;

var dbConnection = require("./Database/dbConnector.js")().getConnection();
var configs = require("./configs.js");
var express = require("express");
var app = express();


passport.use("login", new localStrategy({
	usernameField: "id",
	passwordField: "password",
	passReqToCallback: true
}, function (event, id, password, done) {
	dbConnection.query("SELECT * FROM users WHERE id = ?", id, function (error, result) {
		if (error) {
			return done("DB Connection Failure.");
		}
		else {
			if (result.length > 0) {
				if (result[0].password == password) {
					return done(null, result[0]);
				}
			}
		}

		return done(null, false);
	});
	}));

passport.use("kakao", new kakaoStratgey({
	clientID: configs.kakaotalk.client_id,
	callbackURL: configs.kakaotalk.callbackURL
}, function (accessToken, refreshToken, profile, done) {

}));

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});