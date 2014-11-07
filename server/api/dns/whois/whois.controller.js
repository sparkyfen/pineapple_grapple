'use strict';

var validator = require('validator');
var whois = require('./shadow-whois');

function checkWirelessProvider(org) {
  var orgList = ['SPRINT NEXTEL CORPORATION', 'VERIZON WIRELESS', 'AT&T MOBILITY LLC', 'T-MOBILE USA INC.'];
  if(orgList.indexOf(org) !== -1) {
    return true;
  }
  return false;
}

// Who is lookup on requested domain.
exports.index = function(req, res) {
  var ip;
  if(req.method === 'POST') {
    ip = req.body.ip;
  } else if(req.method === 'GET') {
    ip = req.query.ip;
  }
  if(validator.isNull(ip)) {
    return res.json(400, {message: 'Missing IP address.'});
  }
  if(!validator.isIP(ip, 4)) {
    return res.json(400, {message: 'Invalid IP address.'});
  }
  whois.lookup(ip, function (err, data) {
    if(err) {
      console.log(err);
      return res.json(500, {message: 'Issue looking up requested address.'});
    }
    var org = data[data.length - 1];
    org = org.trim();
    var isWirelessProvider = checkWirelessProvider(org);
    return res.json({org: org, isWirelessProvider: isWirelessProvider});
  });
};