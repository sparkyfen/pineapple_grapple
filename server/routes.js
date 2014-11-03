/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');

module.exports = function(app) {

  // Insert routes below
  app.use('/api/ap/addRecord', require('./api/ap/addRecord'));
  app.use('/api/ap/getRecord', require('./api/ap/getRecord'));
  app.use('/api/dns/query', require('./api/dns/query'));
  app.use('/api/dns/whois', require('./api/dns/whois'));
  app.use('/api/dns/soa', require('./api/dns/soa'));
  app.use('/api/dns/spf', require('./api/dns/spf'));
  app.use('/api/dns/commonDomains', require('./api/dns/commonDomains'));
  app.use('/api/ip/query', require('./api/ip/query'));
  app.use('/api/ip/spfToNetworks', require('./api/ip/spfToNetworks'));

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*').get(function(req, res) {
    res.sendfile(app.get('appPath') + '/index.html');
  });
};
