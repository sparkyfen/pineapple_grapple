'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');
var db = require('../../../components/database');
db.initialize();

describe('POST /api/ap/addRecord', function() {

  afterEach(function (done) {
    db.deleteNodeByApMac('40:16:7e:31:2b:2d', function (error) {
      if(error) {
        console.log('Error deleting node from database.'.red);
        return done(error);
      }
      db.compactNodesDB(function (error) {
        if (error) {
          console.log('Error compacting nodes database.'.red);
          return done(error);
        }
        done();
      });
    });
  });

  it('should respond with JSON array', function(done) {
    request(app)
      .post('/api/ap/addRecord')
      .send({clientMac: '84:38:35:4d:c0:a6', apMac: '40:16:7e:31:2b:2d', ssid: 'cartel', securityType: 'WPA2 Personal', publicIP: '207.17.4.13'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.have.property('message', 'Record added.');
        done();
      });
  });
});