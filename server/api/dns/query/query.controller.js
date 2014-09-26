'use strict';

var validator = require('validator');
var dns = require('dns');

// Looks up the DNS record of the given domain.
exports.index = function(req, res) {
  var domain = req.body.domain;
  if(validator.isNull(domain)) {
    return res.json(400, {message: 'Missing domain.'});
  }
  if(!validator.isFQDN(domain)) {
    return res.json(400, {message: 'Invalid domain.'});
  }
  dns.resolve4(domain, function (error, addresses) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'Could not lookup the requested domain.'});
    }
    return res.json(addresses);
  });
};