'use strict';

// Test specific configuration
// ===========================
module.exports = {
  session: {
    secret: 'ktIaxzNmkENYa4F%azQW6i4#xW!wL#pV#Ak@e19Hf1#tRasGRykHpDxhk2uQ^57s' // 64+ char phrase
  },
  couchdb: {
    url: 'http://localhost:5984',
    nodes: 'pineapple-test-nodes'
  },
  wigle: {
    username: 'testUser',
    password: 'testPassword'
  }
};