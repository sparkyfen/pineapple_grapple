'use strict';

var validator = require('validator');
var uuid = require('node-uuid');
var db = require('../../../components/database');
var settings = require('../../../config/environment');
db.initialize();
var nodes = db.getNodesTable();

exports.index = function(req, res) {
  var ssid = req.body.ssid;
  var apMac = req.body.apMac;
  var clientMac = req.body.clientMac;
  var securityType = req.body.securityType;
  var publicIP = req.body.publicIP;
  var hops = req.body.hops;
  var node = {};
  if(validator.isNull(ssid)) {
    return res.json(400, {message: 'SSID is missing.'});
  }
  if(validator.isNull(apMac)) {
    return res.json(400, {message: 'AP Mac address is missing.'});
  }
  if(validator.isNull(clientMac)) {
    return res.json(400, {message: 'Client MAC address is missing.'});
  }
  if(validator.isNull(securityType)) {
    return res.json(400, {message: 'Security type is missing.'});
  }
  if(validator.isNull(publicIP)) {
    return res.json(400, {message: 'Public IP address is missing.'});
  }
  if(validator.isNull(hops)) {
    return res.json(400, {message: 'Traceroute hops is missing.'});
  }
  if(!validator.isMacAddress(apMac)) {
    return res.json(400, {message: 'Invalid AP Mac address.'});
  }
  if(!validator.isMacAddress(clientMac)) {
    return res.json(400, {message: 'Invalid client Mac address.'});
  }
  if(!validator.isIP(publicIP, 4)) {
    return res.json(400, {message: 'Invalid public IP address.'});
  }
  if(!isValidTracerouteHops(hops)) {
    return res.json(400, {message: 'Invalid Traceroute hops list.'});
  }
  // TODO Add some searching via Google GeoLocation API
  db.searchByApMac(apMac, function (error, reply) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Could not add record.'});
    }
    if(reply.rows.length === 0) {
      // We don't have that value in the DB so store it.
      node = {
        updateTime: [Date.now(Date.UTC())],
        clientMac: [clientMac],
        apMac: apMac,
        ssid: ssid,
        securityType: securityType,
        publicIP: [publicIP],
        hops: [hops]
      };
      db.insert(nodes, uuid.v4(), node, function (error) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Could not add record.'});
        }
        return res.json({message: 'Record added.'});
      });
    } else {
      // We have the value in the DB, update or check if we should.
      node = reply.rows[0].value;
      var utcNow = Date.now(Date.UTC());
      var recentUpdate = node.updateTime[node.updateTime.length - 1];
      // Only allow additions every 20 minutes.
      if(utcNow - recentUpdate > 1200000) {
        node.updateTime.push(utcNow);
        node.clientMac.push(clientMac);
        node.publicIP.push(publicIP);
        node.hops.push(hops);
        if(node.ssid !== ssid) {
          // TODO We have a change in SSID for a particular access point mac address.
        }
        db.insert(nodes, node._id, node, function (error) {
          if(error) {
            console.log(error);
            return res.json(500, {message: 'Could not add record.'});
          }
          return res.json({message: 'Record added.'});
        });
      } else {
        // Don't alert the user of when they can update again to "obscure" the time.
        return res.json(400, {message: 'Record has been updated too recently, try again later.'});
      }
      return res.json({message: 'Record added.'});
    }
  });
};

validator.extend('isMacAddress', function (str) {
  return str.match(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/) !== null ? true : false;
});

function isValidTracerouteHops(hops) {
  if(!hops instanceof Array) {
    return false;
  }
  for (var i = 0; i < hops.length; i++) {
    if(!validator.isNull(hops[i]) && !validator.isIP(hops[i], 4)) {
      return false;
    }
  }
  return true;
}