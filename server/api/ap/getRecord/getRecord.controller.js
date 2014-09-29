'use strict';

var validator = require('validator');
var db = require('../../../components/database');
var settings = require('../../../config/environment');
db.initialize();
var nodes = db.getNodesTable();

// Get a record given a AP mac address.
exports.index = function(req, res) {
  var apMac = req.body.apMac;
  if(validator.isNull(apMac)) {
    return res.json(400, {message: 'AP Mac address is missing.'});
  }
  if(!validator.isMacAddress(apMac)) {
    return res.json(400, {message: 'Invalid AP Mac address.'});
  }
  db.searchByApMac(apMac, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Could not add record.'});
    }
    if(reply.rows.length === 0) {
      return res.json(400, {message: 'Record does not exist.'});
    }
    var node = reply.rows[0].value;
    delete node._id;
    delete node._rev;
    return res.json(node);
  });
};