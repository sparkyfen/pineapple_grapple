'use strict';

var exec = require('child_process').exec;
var child;

exports.lookup = function (address, callback) {
  child = exec('whois -h asn.shadowserver.org "origin ' + address + '"', function (error, stdout, stderr) {
    if(error) {
      return callback(error);
    }
    if(stderr) {
      return callback(stderr)
    }
    var lookupArr = stdout.split("|");
    return callback(null, lookupArr);
  });
};