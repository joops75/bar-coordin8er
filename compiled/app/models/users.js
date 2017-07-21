'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var User = new Schema({
    github: {
        id: String,
        displayName: String,
        username: String,
        publicRepos: Number
    },
    attending: Array
});

module.exports = mongoose.model('User', User);
//# sourceMappingURL=users.js.map
