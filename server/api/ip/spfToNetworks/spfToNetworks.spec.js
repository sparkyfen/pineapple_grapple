'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('POST /api/ip/spfToNetworks', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .post('/api/ip/spfToNetworks')
      .send({domain: 'google.com'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});