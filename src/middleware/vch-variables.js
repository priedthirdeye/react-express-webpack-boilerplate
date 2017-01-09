'use strict';

//var app = require('../../app');
var sql = require('mssql');
var _ = require('lodash');
var cp = require('../database/get-connection')();

/*

function vchVariables() {
  return function(req, res, next) {
    var pclub = req.query.pclub;    
     
    if (pclub) {
        new sql.Request()
        .input('cClub', sql.VarChar(50), pclub) 
        .execute('if_live.[dbo].[SP_VCHGlobalVariables]').then(function(recordsets) {
            var arrData = _.flatMap(recordsets);
            var sanitized = {};
            for (var i = 0, len = arrData.length; i < len; i++) {
                var obj = arrData[i];
                for (var prop in obj) {                    
                    if (obj[prop] instanceof Buffer !== true && typeof obj[prop].length !== 'undefined') {
                        sanitized['g' + prop.toLowerCase()] = obj[prop]; 
                    }
                }
            }
            app.locals = Object.assign({}, app.locals, sanitized);    
            return next();                 
        }).catch(function(err) {
            console.log('err1', err);
        });
    }       
  };
}
*/

module.exports = function getVCHVariables(req, res, next) {
    var pclub = req.query.pclub;           
    if (pclub) {  
        cp.then(
            function(conn) {
                //do something with connection
                new sql.Request(conn)
                .input('cClub', sql.VarChar(50), pclub) 
                .execute('if_live.[dbo].[SP_VCHGlobalVariables]').then(function(recordsets) {
                    var arrData = _.flatMap(recordsets);
                    var sanitized = {};
                    for (var i = 0, len = arrData.length; i < len; i++) {
                        var obj = arrData[i];
                        for (var prop in obj) {                    
                            if (obj[prop] instanceof Buffer !== true && typeof obj[prop].length !== 'undefined') {
                                sanitized['g' + prop.toLowerCase()] = obj[prop]; 
                            }
                        }
                    }
                    res.locals = Object.assign({}, res.locals, sanitized);    
                    next();              
                }).catch(function(err) {
                    console.log('err1', err);
                });  
            },
            function(err) {
                console.error(err);
                process.exit(666);
            }
        );

    } else {
        next(); 
    }
};

