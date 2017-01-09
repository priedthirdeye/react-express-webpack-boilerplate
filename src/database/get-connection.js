//getConnection module
//var conOptions = require('../config/sql'); //store your connection options wherever
//var config = require('config');
//var connOptions = config.get('Database.ifriends_v2_1db'); //currently sql1 by default. must support parameter driven server options.
var connOptions = {
            'user': process.env.DB_USER,
            'password': process.env.DB_PASS,
            'server': process.env.DB_SQLSVR1,
            'pool': {
                'max': 10,
                'min': 0,
                'idleTimeoutMillis': 30000
            }
};

var mssql = require('mssql');
var Promise = require('i-promise'); 
var cp = null;
module.exports = getConnection;

function getConnection() {
  if (cp) return cp;  
  cp = new Promise(function(resolve, reject) {
    var conn = new mssql.Connection(connOptions, function(err) {
      if (err) {
        cp = null;       
        return reject(err);
      }      
      return resolve(conn);
    });
  });
  return cp;
}
