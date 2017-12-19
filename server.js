'use strict';

global.pagePath = __dirname + "/Pages/";

var express = require("express");
var session = require('express-session');
var MySQLStore = require('express-mysql-session');

var bodyParser = require('body-parser');
var passport = require("passport");
var app = express();

app.use(session({
	secret: 'asdrer5613456^#%^$^%dsf1',
	resave: false,
	saveUninitialized: true,
	store: new MySQLStore({
		host: "localhost",
		user: "root",
		password: "1234",
		database: 'dgswproject'
	})
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/Pages", require("./Routers/pages.js"));
app.use("/apis", require("./Routers/apis.js"));

require("./passport.js");

app.get('/', function (request, response) {
	if (request.isAuthenticated())
		response.redirect("/Pages/projects");
	else
		response.redirect("/Pages/login");
});

app.listen(3000, function () {
	console.log("Server is running on 3000 port.");
});