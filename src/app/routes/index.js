'use strict'

var path = require('path')
var directory = __dirname
var folder
if (directory.split('\\').length > 1) {//indicates address is split by back slashes (windows environment)
  var arr = directory.split('\\')
  folder = arr[arr.length - 3]
} else {//indicates address is split by forward slashes (linux environment)
  var arr = directory.split('/')
  folder = arr[arr.length - 3]
}

var BarsHandler = require(path.join(process.cwd() + '/' + folder + "/app/controllers/barsHandler.server.js"))

module.exports = function(app, passport) {
    function isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        } else {
            res.end('not logged in')//must respond with *something* or else code in ajax request won't run
        }
    }
    var barsHandler = new BarsHandler()
    app.route('/')
        .get(function(req, res) {
            res.sendFile(process.cwd() + '/' + folder + '/public/bars.html')
        })
    app.route('/logout')
        .get(function(req, res) {
            req.logout()
            res.redirect('/')
        })
    app.route('/api/:id')
        .get(isLoggedIn, function(req, res) {
            res.json(req.user)
        })
    app.route('/auth/github')
        .get(passport.authenticate('github'))
    app.route('/auth/github/callback')
        .get(passport.authenticate('github', {
            successRedirect: '/',
            failureRedirect: '/'
        }))
    app.route('/api/:id/bars')
        .get(barsHandler.getBars)
    app.route('/api/:id/attendBar')
        .post(barsHandler.attendBar)
    app.route('/api/:id/getAttendees')
        .get(barsHandler.getAttendees)
}