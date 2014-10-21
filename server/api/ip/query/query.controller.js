'use strict';

var validator = require('validator');
var dns = require('dns');

// Get list of querys
exports.index = function(req, res) {
  var ip = req.body.ip;
  if(validator.isNull(ip)) {
    return res.json(400, {message: 'Missing IP address(es).'});
  }
  if(ip instanceof Array) {
    var ipList = [];
    for (var i = 0; i < ip.length; i++) {
      (function (i) {
        if(!validator.isIP(ip[i], 4)) {
          return res.json(400, {message: 'One or more IP addresses is invalid.'});
        } else {
          dns.reverse(ip[i], function(error, domains) {
            if(error) {
              console.log(error);
              ipList.push({ip: ip[i], domains: []});
              if(ipList.length === ip.length) {
                return res.json(ipList);
              }
            } else {
              ipList.push({ip: ip[i], domains: domains});
              if(ipList.length === ip.length) {
                return res.json(ipList);
              }
            }
          });
        }
      })(i);
    }
  }
  else if(!validator.isIP(ip, 4)) {
    return res.json(400, {message: 'Invalid IP v4 address.'});
  } else {
    dns.reverse(ip, function (error, domains) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Could not lookup the requested IP address.'});
      }
      return res.json(domains);
    });
  }
};