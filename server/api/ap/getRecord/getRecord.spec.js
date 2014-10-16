'use strict';

var should = require('should');
var colors = require('colors');
var uuid = require('node-uuid');
var app = require('../../../app');
var request = require('supertest');
var db = require('../../../components/database');
db.initialize();
var nodes = db.getNodesTable();

describe('POST /api/ap/getRecord', function() {

  beforeEach(function (done) {
    var node = {
      'updateTime':[1412020518442],
      'clientMac':['84:38:35:4d:c0:a6'],
      'apMac':'40:16:7e:31:2b:2d',
      'ssid':'cartel',
      'securityType': 'WPA2 Personal',
      'publicIP': '207.17.4.13'
    };
    db.insert(nodes, uuid.v4(), node, function (error) {
      if (error) {
        console.log('Error inserting new node.'.red);
        return done(error);
      }
      done();
    });
  });
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

  it('should respond with request node record', function(done) {
    request(app)
      .post('/api/ap/getRecord')
      .send({apMac: '40:16:7e:31:2b:2d'})
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }
        res.body.should.have.property('updateTime').with.lengthOf(1);
        res.body.should.have.property('clientMac').with.lengthOf(1);
        res.body.should.have.property('apMac', '40:16:7e:31:2b:2d');
        res.body.should.have.property('ssid', 'cartel');
        done();
      });
  });
});