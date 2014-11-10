'use strict';

var validator = require('validator');
var settings = require('../../../../config/environment');
var wigle = require('wigle.js');

function getSecurityType(input) {
  switch(input) {
    case '?':
    return 'Unknown';
    case 'N':
    return 'Open';
    case 'Y':
    return 'WEP';
    case 'W':
    return 'WPA';
    case '2':
    return 'WPA2';
    default:
    return 'Unknown';
  }
}

// Get list of locations
exports.index = function(req, res) {
  var apMac;
  if(req.method === 'GET') {
    apMac = req.query.apMac;
  } else {
    apMac = req.body.apMac;
  }
  if(validator.isNull(apMac)) {
    return res.json(400, {message: 'AP Mac address is missing.'});
  }
  if(!validator.isMacAddress(apMac)) {
    return res.json(400, {message: 'Invalid AP Mac address.'});
  }
  wigle.login(settings.wigle.username, settings.wigle.password, function (error, results) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Could not retrieve location information on AP MAC address.'});
    }
    wigle.location({
      netid: apMac,
      operator: '',
      lac: '',
      cid: '',
      system: '',
      network: '',
      basestation: ''
    }, function (error, results) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Could not retrieve location information on AP MAC address.'});
      }
      if(results.result.length === 0) {
        return res.json(400, {message: 'Record does not exist.'});
      }
      var node = {
        updateTime: [results.result[0].firsttime, results.result[0].lasttime],
        apMac: results.result[0].netid,
        ssid: results.result[0].ssid,
        securityType: getSecurityType(results.result[0].wep),
        location: {
          lat: results.result[0].trilat,
          lng: results.result[0].trilong
        }
      };
      return res.json(node);
    });
  });
};