'use strict';

var validator = require('validator');
var dns = require('native-dns');

// Get the SOA of a requested domain.
exports.index = function(req, res) {
  var domain = req.body.domain;
  if(validator.isNull(domain)) {
    return res.json(400, {message: 'Missing domain from request.'});
  }
  if(!validator.isFQDN(domain)) {
    return res.json(400, {message: 'Invalid domain in request.'});
  }
  var dnsQues = dns.Question({
    name: domain,
    type: 'SOA'
  });
  var dnsReq = dns.Request({
    question: dnsQues,
    server: {address: '8.8.8.8', port: 53, type: 'udp'},
    timeout: 1000
  });
  dnsReq.on('timeout', function () {
    return res.json(500, {message: 'DNS request timed out.'});
  });
  dnsReq.on('message', function (error, answers) {
    if(error) {
      console.log(error);
      return res.json(500, {message: 'An error occured querying the DNS record.'});
    }
    return res.json(answers.answer[0]);
  });
  dnsReq.send();
};