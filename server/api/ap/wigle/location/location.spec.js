'use strict';

var should = require('should');
var nock = require('nock');
var app = require('../../../../app');
var settings = require('../../../../config/environment');
var request = require('supertest');

describe('GET /api/ap/wigle/location', function() {

  beforeEach(function (done) {
    // We don't care about the body, as long as the cookie comes back.
    nock('https://wigle.net')
    .post('/site/site/login', {
      credential_0: settings.wigle.username,
      credential_1: settings.wigle.password,
      destination: '/',
      noexpire: 'on'
    })
    .reply(200, '', {
     'Set-Cookie': settings.wigle.username
    });
    // We want some fake data to come back to match our expected query, just the ap mac address is ok.
    nock('https://wigle.net')
    .post('/api/v1/jsonLocation')
    .reply(200, {
      success: true,
      wifi: true,
      gsm: false,
      cdma: false,
      result:
       [{trilong: '-112.07376099',
           wep: '?',
           channel: '1',
           qos: '2',
           firsttime: '2014-09-19 18:15:22',
           freenet: '?',
           lasttime: '2014-10-25 00:22:51',
           transid: '20140919-00603',
           visible: 'Y',
           flags: null,
           discoverer: 'mockUser',
           name: null,
           trilat: '33.45394135',
           paynet: '?',
           netid: '00:00:00:00:00:00',
           lastupdt: '2014-10-25 00:24:33',
           comment: null,
           type: 'infra',
           bcninterval: null,
           locationData: [Object],
           ssid: 'mySSID',
           dhcp: '?'}]
    });
    done();
  });
  afterEach(function (done) {
    done();
  });

  it('should respond with JSON object', function(done) {
    request(app)
      .get('/api/ap/wigle/location?apMac=00:00:00:00:00:00')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Object);
        done();
      });
  });
});