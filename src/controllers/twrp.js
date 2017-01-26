const _ = require('lodash');
const sql = require('mssql');
const cp = require('../database/get-connection')();

function getVarType(variable) {
  console.log(variable);
  if (variable.indexOf('N\'') == 0) {
    return 'nvarchar';
  } else if (variable.indexOf('\'') == 0) {
    return 'varchar';
  } 
  return 'int';
}

function parseSqlStatement(sql, transformVars) {        
        var re = new RegExp("N{0,1}'{0,1}~var:[a-z0-9]+~'{0,1}", "gi");
        var variables = sql.match(re);            
        for (var i = 0; i < variables.length; i++) {
            var key = variables[i].toLowerCase().replace(/N{0,1}'{0,1}~'{0,1}/g, '').replace('var:', '');
            var found = transformVars[key];            
            if (found) {                
                sql = sql.toLowerCase().replace('~var:' + key + '~', found);
            } else {                
                sql = sql.toLowerCase().replace('~var:' + key + '~', (getVarType(variables[i]) !== 'int' ? '' : null));
            }
        }
        return sql;
}

module.exports = function(prData) {
    //_.find(appData,{'PrimaryTemplate'}
    let t = prData.primarytemplate.replace('.htm', '');

    //let sp_name = prData.sp_name;
   // let prData = prData;
    
   // console.log(modes);

    return function(req, res, next) {          
            console.log(req.query.pmode);
            if (typeof req.query.pmode === 'undefined') {
                console.log(prData.sp_name);
            }
            //console.log(prDataLoc);
            //var parameterObj = transformParameters(req.params);    
        //var pageVariables = res.locals;
        res.locals = Object.assign({}, res.locals, prData);

        //console.log(res.locals);
        console.log(parseSqlStatement(prData.sp_name, res.locals));

        cp.then(
            function(conn) {
                //do something with connection
                new sql.Request(conn)
                //.input('cClub', sql.VarChar(50), pclub) 
                //.execute('if_live.[dbo].[SP_VCHGlobalVariables]').then(function(recordsets) {
                .query(parseSqlStatement(prData.sp_name, res.locals)).then(function(recordsets) {
                    var arrData = _.flatMap(recordsets);
                    //console.log(arrData);
                    var loops = _.groupBy(arrData, 'settype'); 
                    console.log(loops);
                    res.locals['__data'] = JSON.stringify(loops);
                    res.locals = Object.assign({}, res.locals, loops);              
                    res.render(t, {
                        title: 'req.params.model',
                        route: req.url,
                        params: JSON.stringify(req.params)
                    });                    
                }).catch(function(err) {
                    console.log('err1', err);
                    res.render(t, {
                        route: req.url
                    });                        
                });  
            },
            function(err) {
                console.error(err);
                
                process.exit(666);
            }
        );


/*
        cp.then(
            function(conn) {
                //do something with connection
                new sql.Request(conn)
                //.input('cClub', sql.VarChar(50), pclub) 
                //.execute('if_live.[dbo].[SP_VCHGlobalVariables]').then(function(recordsets) {
                .query`exec if_live.[dbo].[SP_VCHGlobalVariables] 'caitest3'`.then(function(recordsets) {
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
*/


    };
};

/*
var express = require('express');

var router = express.Router();
//var routes = require('../data/routes');

router.get('/:params*', (req, res, next) => {
        console.log('url', req.url);
        res.render('index', {
        title: req.params.model,
        hasAccess: true,
        total: 3,
        route: req.url,
        params: JSON.stringify(req.params),
        color: 'blue',
        applivehosts: [{'vchscreennamesimple': 'TWRP'},{'vchscreennamesimple': 'TWRP2'}]
    });
});

module.exports = router;

*/
