var settings = require('../../config/environment');

exports.initialize = function() {
  this.nano = require('nano')(settings.couchdb.url);
  this.nodes = this.nano.use(settings.couchdb.nodes);
};

exports.createDB = function(dbName, callback) {
  this.nano.db.create(dbName, function (error, body) {
    if(error) {
      return callback(error);
    }
    return callback(null, body);
  });
};

exports.compactNodesDB = function(callback) {
  this.nano.db.compact(settings.couchdb.nodes, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

exports.insert = function(db, key, data, callback) {
  db.insert(data, key, function (err) {
    if(err) {
      return callback(err);
    }
    return callback(null);
  });
};

exports.getNodesTable = function() {
  return this.nodes;
};

exports.getNode = function(nodeId, callback) {
  this.nodes.get(nodeId, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

exports.searchByClientMac = function(clientMac, callback) {
  this.nodes.view('nodes', 'by_client_mac', {reduce: false, startkey: clientMac, endkey: clientMac}, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

exports.searchByNodeId = function(nodeId, callback) {
  this.nodes.view('nodes', 'by_id', {reduce: false, startkey: nodeId, endkey: nodeId}, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

exports.searchByMultipleNodeIds = function(nodeIds, callback) {
  this.nodes.view('nodes', 'by_id', {reduce: false, keys: nodeIds}, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

exports.searchByApMac = function (apMac, callback) {
  // TODO We are using an array and searching via string. Fix here and addRecord.controller.js and install.js
  this.nodes.view('nodes', 'by_ap_mac', {reduce: false, startkey: apMac, endkey: apMac}, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

exports.searchTeamByAll = function(callback) {
  this.nodes.view('nodes', 'all', {reduce: false}, function (error, reply) {
    if (error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};

exports.deleteNodeByClientMac = function(clientMac, callback) {
    var _self = this;
    _self.nodes.view('nodes', 'by_client_mac', {reduce: false, startkey: clientMac, endkey: clientMac}, function (error, reply) {
      if(error) {
        return callback(error);
      }
      if(reply.rows.length === 0) {
        return callback('Node does not exist.');
      }
      var node = reply.rows[0].value;
      console.log('Deleting node from DB.');
      console.log(node);
      _self.nodes.destroy(node._id, node._rev, function (error, body) {
        if(error) {
          return callback(error);
        }
        return callback(null, body);
      });
    });
};

exports.deleteNodeByApMac = function(apMac, callback) {
    var _self = this;
    _self.nodes.view('nodes', 'by_ap_mac', {reduce: false, startkey: apMac, endkey: apMac}, function (error, reply) {
      if(error) {
        return callback(error);
      }
      if(reply.rows.length === 0) {
        return callback('Node does not exist.');
      }
      var node = reply.rows[0].value;
      console.log('Deleting node from DB.');
      console.log(node);
      _self.nodes.destroy(node._id, node._rev, function (error, body) {
        if(error) {
          return callback(error);
        }
        return callback(null, body);
      });
    });
};

exports.deleteAllNodes = function(docs, callback) {
  this.users.bulk({docs: docs}, function (error, reply) {
    if(error) {
      return callback(error);
    }
    return callback(null, reply);
  });
};