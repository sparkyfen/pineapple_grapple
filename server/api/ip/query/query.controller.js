'use strict';

var validator = require('validator');
var dns = require('dns');

// Get list of querys
exports.index = function(req, res) {
  var ip = req.body.ip;
  if(validator.isNull(ip)) {
    return res.json(400, {message: 'Missing IP address.'});
  }
  if(!validator.isIP(ip, 4)) {
    return res.json(400, {message: 'Invalid IP v4 address.'});
  }
  dns.reverse(ip, function (error, domains) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Could not lookup the requested IP address.'});
    }
    return res.json(domains);
  });
};