'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('POST /api/ip/query', function() {

  it('should respond with JSON array', function(done) {
    request(app)
      .post('/api/ip/query')
      .send({ip: '74.125.224.102'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});