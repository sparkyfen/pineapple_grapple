'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('GET /api/dns/whois', function() {

  it('should respond with JSON object', function(done) {
    request(app)
      .get('/api/dns/whois?ip=8.8.8.8')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });
});