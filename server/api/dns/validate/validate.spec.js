'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('GET /api/dns/validate', function() {

  it('should respond with JSON object', function(done) {
    request(app)
      .get('/api/dns/validate?domain=google.com&ips=208.117.233.117&ips=208.117.233.118')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });
});