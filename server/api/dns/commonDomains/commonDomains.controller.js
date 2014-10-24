'use strict';

// Return a list of common domains to use when checking for a MITM attack.
exports.index = function(req, res) {
  res.json(['google.com', 'chase.com', 'wellsfargo.com', 'bankofamerica.com']);
};