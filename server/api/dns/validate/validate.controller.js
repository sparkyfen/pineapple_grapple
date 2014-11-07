'use strict';

var validator = require('validator');
var rangeCheck = require('range_check');
var whois = require('./shadow-whois');

function validateNetworkOwner(networkOwner, domain, callback) {
  var allowedOwners = {
    'google.com': 'GOOGLE.COM',
    'wellsfargo.com': 'WACHOVIASECURITIES.COM',
    'chase.com': 'JPMCHASE.COM',
    'bankofamerica.com': 'BANKOFAMERICA.COM'
  };
  if(Object.keys(allowedOwners).indexOf(domain) === -1) {
    return {isValid: false, message: 'The requested domain is not in the allowed list.'};
  }
  if(allowedOwners[domain] !== networkOwner) {
    return {isValid: false, message: 'The domain and network owner do not match.'};
  }
  return {isValid: true};
}

function isPrivate(address) {
  return rangeCheck.in_range(address, ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '127.0.0.0/8']);
}

function final(res) {
  return res.json({message: 'IP address(es) is/are valid.'});
}

// Validates the requested IPs with thier domain.
exports.index = function(req, res) {
  var domain;
  var ips;
  if(req.method === 'GET') {
    domain = req.query.domain;
    ips = req.query.ips;
  } else if(req.method === 'POST') {
    domain = req.body.domain;
    ips = req.body.ips;
  }
  if(validator.isNull(ips)) {
    return res.json(400, {message: 'Missing IP address list.'});
  }
  if(validator.isNull(domain)) {
    return res.json(400, {message: 'Missing domain name.'});
  }
  if(!validator.isFQDN(domain)) {
    return res.json(400, {message: 'Invalid domain name.'});
  }
  if(!(ips instanceof Array) && typeof(ips) !== 'string') {
    return res.json(400, {message: 'IP addresses must be a list or string.'});
  }
  if(ips.length > 50) {
    return res.json(400, {message: 'Too many IP addresses to check.'});
  }
  if(typeof(ips) === 'string') {
    ips = [ips];
  }
  var ipBlockList = [];
  function series(ip, res) {
    if(ip) {
      if(!validator.isIP(ip, 4)) {
        return res.json(400, {message: 'One or more IP addresses was invalid.'});
      }
      if(isPrivate(ip)) {
        return res.json(400, {message: 'One or more IP addresses requested is a private/loopback IP address.'});
      }
      if(rangeCheck.in_range(ip, ipBlockList)) {
        return series(ips.shift(), res);
      }
      // TODO As part of the lookup, we should store the results in a cache and then check the cache for faster responses.
      whois.lookup(ip, function (error, data) {
        if(error) {
          console.log(error);
          return res.json(500, {message: 'Issue validating IP addresses.'});
        }
        var ipBlock= data[1];
        if(!ipBlock) {
          console.log('Misssing ip block from: ' + data);
          return res.json(500, {message: 'Issue validating IP addresses.'});
        }
        ipBlock = ipBlock.trim();
        var networkOwner = data[data.length - 2];
        if(!networkOwner) {
          console.log('Missing network owner from: ' + data);
          return res.json(500, {message: 'Issue validating IP addresses.'});
        }
        networkOwner = networkOwner.trim();
        var validateInfo = validateNetworkOwner(networkOwner, domain);
        if(!validateInfo.isValid) {
          return res.json(400, {message: validateInfo.message});
        }
        ipBlockList.push(ipBlock);
        if(!rangeCheck.in_range(ip, ipBlockList)) {
          console.log('IP: ' + ip + ' was not in the range of the following list.');
          console.log(ipBlockList);
          return res.json(400, {message: 'One IP address was not in the list of ip ranges allowed.'});
        }
        return series(ips.shift(), res);
      });
    } else {
      return final(res);
    }
  }
  series(ips.shift(), res);
};