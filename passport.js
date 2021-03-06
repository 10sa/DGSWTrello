﻿var passport = require("passport");
var localStrategy = require("passport-local").Strategy;
var KakaoStratgey = require("passport-kakao").Strategy;
var GoogleStratgey = require("passport-google-oauth2").Strategy;
var GithubStratgey = require("passport-github2").Strategy;

var dbConnection = require("./Database/dbConnector.js")().getConnection();
var configs = require("./configs.js");
var express = require("express");
var app = express();

var account = require("./Routers/apis/account.js");


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

passport.use(new KakaoStratgey({
	clientID: configs.kakaotalk.clientId,
	callbackURL: configs.kakaotalk.callbackURL,
}, function (accessToken, refreshToken, profile, done) {
	var profileJson = profile._json;
	loginThirdParty("kakao", profileJson.id, profileJson.properties.nickname, profileJson.id, done);
	}));

passport.use(new GoogleStratgey({
	clientID: configs.google.clientId,
	clientSecret: configs.google.clientSecret,
	callbackURL: configs.google.callbackURL,
	passReqToCallback: true
}, function (accessToken, refreshToken, unknown, profile, done) {
	var profileJson = profile._json;
	loginThirdParty("google", profileJson.id, profileJson.displayName, profileJson.id, done);
	}));

passport.use(new GithubStratgey({
	clientID: configs.github.cliendId,
	clientSecret: configs.github.clientSecret,
	callbackURL: configs.github.callbackURL
}, function (accessToken, refreshToken, profile, done) {
	var profileJson = profile._json;
	loginThirdParty("github", profileJson.id, profileJson.name, profileJson.id, done);
}));

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

function loginThirdParty(authType, authId, authName, authEmail, done) {
	dbConnection.query("SELECT * FROM users WHERE email = ? and thirdPartyId = ?", [authType, authId], function (error, result) {
		if (error)
			return done(error);
		else {
			if (result.length == 0) {
				dbConnection.query("INSERT users VALUES (?, ?, ?, ?, ?, 0)", [authEmail, "", authType, authName, authId], function (error, result) {
					if (error)
						return done(error);
					else {
						dbConnection.query("SELECT * FROM users WHERE thirdPartyId = ?", authId, function (error, result) {
							done(null, result[0]);
						});
					}
				});
			}
			else {
				done(null, result[0]);
			}
		}
	})
}