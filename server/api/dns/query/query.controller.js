'use strict';

var validator = require('validator');
var dns = require('dns');

// Looks up the DNS record of the given domain.
exports.index = function(req, res) {
  var domain = req.body.domain;
  if(validator.isNull(domain)) {
    return res.json(400, {message: 'Missing domain(s).'});
  }
  if(domain instanceof Array) {
    var addressList = [];
    for (var i = 0; i < domain.length; i++) {
      (function (i) {
        if(!validator.isFQDN(domain[i])) {
          return res.json(400, {message: 'One or more domains is invalid.'});
        } else {
          dns.resolve4(domain[i], function(error, addresses) {
            if(error) {
                addressList.push({domain: domain[i], addresses: []});
              if(addressList.length === domain.length) {
                return res.json(addressList);
              }
            }
            addressList.push({domain: domain[i], addresses: addresses});
            if(addressList.length === domain.length) {
              return res.json(addressList);
            }
          });
        }
      })(i);
    }
  } else if(!validator.isFQDN(domain)) {
    return res.json(400, {message: 'Invalid domain.'});
  } else {
    dns.resolve4(domain, function (error, addresses) {
      if(error) {
        console.log(error);
        return res.json(500, {message: 'Could not lookup the requested domain.'});
      }
      return res.json([{domain: domain, addresses: addresses}]);
    });
  }
};