'use strict'

require("dotenv").load()
var yelp = require('yelp-fusion')
var client = yelp.client(process.env.YELP_FUSION_APIKEY)
var Pub = require("../models/pubs.js")
var User = require("../models/users.js")


function barsHandler() {
    this.getBars = function(req, res) {
        var term = req.headers.termdata
        var location = req.headers.locationdata
        var limit = req.headers.limitdata
        var offset = req.headers.offsetdata
        client.search({
            term: term,
            location: location,
            limit: limit,
            offset: offset
        }).then(function(result) {
            res.end(result.body)
        }).catch(function(e) {
            console.log(e);
        })
    }
    var dateFilter = function(attendedBy) {
        var attendedByFiltered = attendedBy.filter(function(attendee) {
            return nextMidnight(Date.now()) == nextMidnight(attendee.date)
        })
        return attendedByFiltered
    }
    var nextMidnight = function(dateInMilliseconds) {
        var dayMilliseconds = 1000 * 60 * 60 * 24
        return Math.ceil(dateInMilliseconds / dayMilliseconds) * dayMilliseconds
    }
    this.getAttendees = function(req, res) {
        var barId = req.headers.bariddata
        Pub.findOne({'id': barId})
        .exec(function(err, pub) {
            if (err) throw err
            if (pub) {
                var filteredArr = dateFilter(pub.attendedBy)
                res.end(filteredArr.length.toString(10))
            } else {
                res.end('0')
            }
        })
    }
    this.attendBar = function(req, res) {
        var username = req.user.github.username
        var barId = req.headers.bariddata
        var newDate = Date.now()
        var nameMatch = function(attendee) {
            return attendee.username == username
        }
        var pubMatch = function(pub) {
            return pub.id == barId
        }
        Pub.findOne({'id': barId})
        .exec(function(err, pub) {
            if (err) throw err
            if (pub) {
                var subdoc = dateFilter(pub.attendedBy)
                var subdocFound = false
                for (let i in subdoc) {
                    if (subdoc[i].username == username) {
                        subdocFound = true
                        break
                    }
                }
                if (subdocFound) {
                    //remove user from attendedBy array and update, then return array length
                    var index = subdoc.findIndex(nameMatch)
                    subdoc.splice(index, 1)
                    Pub.findOneAndUpdate({'id': barId}, { $set: { attendedBy: subdoc }}, function(err) {
                        if (err) throw err
                    })
                } else {
                    subdoc.push({username: username, date: newDate})
                    Pub.findOneAndUpdate({'id': barId}, { $set: { attendedBy: subdoc }}, function(err) {
                        if (err) throw err
                    })
                }
                res.end(subdoc.length.toString(10))
            } else {
                var newPub = new Pub()
                newPub.id = barId
                newPub.attendedBy.push({username: username, date: newDate})
                
                newPub.save(function (err, doc) {
                    if (err) throw err
                })
                res.end(newPub.attendedBy.length.toString(10))
            }
        })
                
        User.findOne({'github.username': username})
        .exec(function(err, attendee) {
            if (err) throw err
            if (attendee) {
                var filteredPubs = dateFilter(attendee.attending)
                var barIdFound = false
                for (let i in filteredPubs) {
                    if (filteredPubs[i].id == barId) {
                        barIdFound = true
                        break
                    }
                }
                if (barIdFound) {
                    var index = filteredPubs.findIndex(pubMatch)
                    filteredPubs.splice(index, 1)
                } else {
                    filteredPubs.push({id: barId, date: newDate})
                }
                User.findOneAndUpdate({'github.username': username}, { $set: { attending: filteredPubs }}, function(err) {
                    if (err) throw err
                })
            }
        })
    }
}
module.exports = barsHandler