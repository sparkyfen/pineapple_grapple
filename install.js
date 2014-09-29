var colors = require('colors');
var settings = require('./server/config/environment');
var db = require('./server/components/database');
db.initialize();

var nodeView = {views: {"all": {"map": "function(doc) {emit(null, doc)}", "reduce": "_count"},"by_client_mac": {"map": "function(doc) {if(doc.clientMac){for(var i = 0; i < doc.clientMac.length; i++){emit(doc.clientMac[i], doc)}}}","reduce": "_count"}, "by_ap_mac": {"map": "function(doc) {emit(doc.apMac, doc)}","reduce": "_count"}, "by_id": {"map": "function(doc) {emit(doc._id, doc)}","reduce": "_count"}, "by_ssid": {"map": "function(doc) {emit(doc.ssid, doc)}","reduce": "_count"}}};

db.createDB(settings.couchdb.nodes, function (err, body) {
  if(err && err.status_code !== 412) {
    return console.log(err);
  }
  var nodes = db.getNodesTable();
  // Insert views to make lookup calls with.
  db.insert(nodes, '_design/nodes', nodeView, function (err) {
    // 409 is Document update conflict.
    if(err && err.status_code !== 409) {
      console.log('Error creating database.'.red);
      return console.log(err);
    }
    console.log('DB Installation successful.'.green);
  });
});