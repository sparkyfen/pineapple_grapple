'use strict';

var validator = require('validator');
var nativeDNS = require('native-dns');
var dns = require('dns');

function getPrimaryDomainAuthority(domain, callback) {
  var soaDnsQues = nativeDNS.Question({
    name: domain,
    type: 'SOA'
  });
  var soaDnsReq = nativeDNS.Request({
    question: soaDnsQues,
    server: {address: '8.8.8.8', port: 53, type: 'udp'},
    timeout: 1000
  });
  soaDnsReq.on('timeout', function () {
    return callback('An error occured querying the DNS record.');
  });
  soaDnsReq.on('message', function (error, answers) {
    if(error) {
      console.log(error);
      return callback('An error occured querying the DNS record.');
    }
    return callback(null, answers.answer[0].primary);
  });
  soaDnsReq.send();
}

function resolveDomain(soa, callback) {
  dns.resolve4(soa, function (error, addresses) {
      if(error) {
        console.log(error);
        return callback('An error occured querying the DNS record.');
      }
      return callback(null, addresses[0])
    });
}

function getSpf(domain, ipaddr, callback) {
  var txtDnsQues = nativeDNS.Question({
    name: domain,
    type: 'TXT'
  });
  var txtDnsReq = nativeDNS.Request({
    question: txtDnsQues,
    server: {address: ipaddr, port: 53, type: 'udp'},
    timeout: 1000
  });
  txtDnsReq.on('timeout', function () {
    return callback('DNS request timed out.');
  });
  txtDnsReq.on('message', function (error, answers) {
    if(error) {
      console.log(error);
      return callback('An error occured querying the DNS record.');
    }
    // Return the first result that is has spf in the value.
    for (var i = 0; i < answers.answer.length; i++) {
      if(answers.answer[i].data[0].indexOf('spf1') !== -1) {
        return callback(null, answers.answer[i].data[0]);
      }
    }
  });
  txtDnsReq.send();
}


// Gets the SPF given the requested domain.
exports.index = function(req, res) {
  var domain = req.body.domain;
  if(validator.isNull(domain)) {
    return res.json(400, {message: 'Missing domain from request.'});
  }
  if(!validator.isFQDN(domain)) {
    return res.json(400, {message: 'Invalid domain in request.'});
  }
  getPrimaryDomainAuthority(domain, function (error, soa) {
    if(error) {
      console.log(error);
      return res.json(500, {message: error});
    }
    resolveDomain(soa, function (error, ipaddr) {
      if(error) {
        return res.json(500, {message: error});
      }
      getSpf(domain, ipaddr, function (error, spf) {
        if(error) {
          return res.json(500, {message: error});
        }
        return res.json({spf: spf});
      });
    });
  });
};