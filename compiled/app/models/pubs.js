'use strict';

var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Pub = new Schema({
    id: String,
    attendedBy: Array
});

module.exports = mongoose.model('Pub', Pub);
//# sourceMappingURL=pubs.js.map
