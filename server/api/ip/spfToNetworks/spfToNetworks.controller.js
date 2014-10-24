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
    return callback('DNS request timed out.')
  });
  txtDnsReq.on('message', function (error, answers) {
    if(error) {
      console.log(error);
      return callback('An error occured querying the DNS record.')
    }
    // Return the first result that is has spf in the value.
    for (var i = 0; i < answers.answer.length; i++) {
      if(answers.answer[i].data[0].indexOf('spf1') !== -1) {
        return callback(null, {spf: answers.answer[i].data[0], dnsServer: ipaddr});
      }
    }
  });
  txtDnsReq.send();
}

function getIPBlocks(spfData, callback) {
  var addressBlocks = [];
  var spf = spfData.spf;
  var dnsServer = spfData.dnsServer;
  var spfArr = spf.split(" ");
  spfArr.splice(0, 1);
  var done = false;
  console.log(spfArr);
  if(spfArr.indexOf('~all') !== -1 || spfArr.indexOf('+all') !== -1 || spfArr.indexOf('-all') !== -1) {
    spfArr.splice(spfArr.length - 1, 1);
  }
  for (var i = 0; i < spfArr.length; i++) {
    (function (i) {
      var spfVal = spfArr[i];
      if(spfVal.indexOf('ip4') !== -1) {
        var addressBlock = spfVal.split('ip4:')[1];
        addressBlocks.push(addressBlock);
        done = true;
      } else if(spfVal.indexOf('include:') === 0) {
        var includeAddress = spfVal.split('include:')[1];
        getSpf(includeAddress, dnsServer, function (error, spfData){
          if(error) {
            return callback(error);
          }
          getIPBlocks(spfData, function (error, addressBlocks) {
            if(error) {
              return callback(error);
            }
            done = true;
            console.log('DONE INCLUDE');
            return callback(null, addressBlocks);
          });
        });
      } else if(spfVal.indexOf('redirect=') === 0) {
        var redirectAddress = spfVal.split('redirect=')[1];
        getSpf(redirectAddress, dnsServer, function (error, spfData){
          if(error) {
            return callback(error);
          }
          getIPBlocks(spfData, function (error, addressBlocks) {
            if(error) {
              return callback(error);
            }
            done = true;
            console.log('DONE REDIRECT');
            return callback(null, addressBlocks);
          });
        });
      }
    })(i);
  }
  if(done) {
    console.log('DONE');
    return callback(null, addressBlocks);
  }
}


// Finds the IP network blocks for a requested domain.
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
      return res.json(500, {message: error});
    }
    resolveDomain(soa, function (error, ipaddr) {
      if(error) {
        return res.json(500, {message: error});
      }
      getSpf(domain, ipaddr, function (error, spfData) {
        if(error) {
          return res.json(500, {message: error});
        }
        getIPBlocks(spfData, function (error, addressBlocks) {
          if(error) {
            return res.json(500, {message: error});
          }
          return res.json(addressBlocks);
        });
      });
    });
  });
};