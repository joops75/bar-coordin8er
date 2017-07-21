'use strict'

var express = require("express"),
    routes = require("./app/routes/index.js"),
    mongoose = require("mongoose"),
    passport = require("passport"),
    session = require("express-session")
var app = express()
require("dotenv").load()
require("./app/config/passport")(passport)
var port = process.env.PORT || 3000

mongoose.connect(process.env.MONGO_URI)

app.use('/public', express.static(__dirname + '/public'))
app.use('/common', express.static(__dirname + '/app/common'))
app.use('/controllers', express.static(__dirname + '/app/controllers'))
app.use(session({
    secret: 'secretClementine',
	resave: false,
	saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())

routes(app, passport)

app.listen(port)