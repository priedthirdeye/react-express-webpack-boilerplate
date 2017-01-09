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
    let t = prData.primarytemplate.replace('.htm', '').trim();

    //let sp_name = prData.sp_name;
   // let prData = prData;
    
   // console.log(modes);

    return function(req, res, next) {          

            //console.log(prDataLoc);
            //var parameterObj = transformParameters(req.params);    
        //var pageVariables = res.locals;
        res.locals = Object.assign({}, res.locals, prData);

        //console.log(res.locals);
        //console.log(parseSqlStatement(prData.sp_name, res.locals));

        cp.then(
            function(conn) {
                //do something with connection
                new sql.Request(conn)
                //.input('cClub', sql.VarChar(50), pclub) 
                //.execute('if_live.[dbo].[SP_VCHGlobalVariables]').then(function(recordsets) {
                .query('exec ' + prData.sp_livehostsvariable).then(function(recordsets) {
                    var arrData = _.flatMap(recordsets);
                    var pageData = {
                        'allpapplivehosts_v2': arrData
                    };

                    //console.log(pageData); 
                    res.locals = Object.assign({}, res.locals, pageData);  
                  //  var loops = _.groupBy(arrData, 'settype'); 
//                    res.locals = Object.assign({}, res.locals, loops);  

/*                    
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
                    */
                    //next();              
                    res.render(t, {
                        title: 'req.params.model',
                        hasAccess: true,
                        total: 3,
                        route: req.url,
                        params: JSON.stringify(req.params),                        
                    });                    
                }).catch(function(err) {
                    console.log('err1', err);
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
module.exports = function(routeData) {
    return function(req, res, next) {            
            var parameterObj = transformParameters(req.params);            
            res.render(routeData.t, {
                title: 'req.params.model',
                hasAccess: true,
                total: 3,
                route: req.url,
                params: JSON.stringify(req.params),
                transformed: JSON.stringify(parameterObj),
                color: 'orange',
                applivehosts: [{'vchscreennamesimple': 'mstest'}, {'vchscreennamesimple': 'caitest3'}]
        });
    };
};
*/
/*
module.exports = function(routeData) {
    var express = require('express');
    var router = express.Router();
    console.log('routeData', routeData);
    var t = routeData.t;
    console.log('/' + routeData.route + '/:a?/:b?/:c?/:d?/:e?/');
    router.get('/' + routeData.route + '/:a?/:b?/:c?/:d?/:e?/', (req, res, next) => {            
            var parameterObj = transformParameters(req.params);
            console.log(parameterObj);
            res.render('site/navigation/livesessions/elitecamviewer/main', {
                title: 'req.params.model',
                hasAccess: true,
                total: 3,
                route: req.url,
                params: JSON.stringify(req.params),
                transformed: JSON.stringify(parameterObj),
                color: 'orange',
                applivehosts: [{'vchscreennamesimple': 'mstest'}, {'vchscreennamesimple': 'caitest3'}]
        });
    });
};

*/
//var routes = require('../data/routes');

/*
router.get('/:params*', (req, res, next) => {
        console.log('url', req.url);
        res.render('index', {
        title: req.params.model,
        hasAccess: true,
        total: 3,
        route: req.url,
        params: JSON.stringify(req.params),
        color: 'blue',
        applivehosts: [{'vchscreennamesimple': 'mstest'},{'vchscreennamesimple': 'caitest3'}]
    });
});

module.exports = router;
*/

function transformParameters(params) {
    if (params) {
        var passedKeys = Object.values(params);
        var routeValueTransforms = require('../data/route-value-transforms');
        var parameterArray = [];
        for (var i = 0, len = passedKeys.length; i < len; i++) {
            var key = passedKeys[i];
            if (routeValueTransforms[key]) {
                parameterArray.push(routeValueTransforms[key]);
            }         
        }
        if (parameterArray.length) {
            var joinedParameterString = parameterArray.join('&');
            return JSON.parse('{"' + decodeURI(joinedParameterString).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}'); 
        }
    }
    return {};           
}

/*
var t;
module.exports = function(setup_t) {
    if (setup_t) {
        t = setup_t;
    }
    console.log('t', t);
    return module.exports;
};

module.exports.get = function(req, res, next) {            
            var parameterObj = transformParameters(req.params);
            console.log(parameterObj);
            res.render(t, {
                title: 'req.params.model',
                hasAccess: true,
                total: 3,
                route: req.url,
                params: JSON.stringify(req.params),
                transformed: JSON.stringify(parameterObj),
                color: 'orange',
                applivehosts: [{'vchscreennamesimple': 'mstest'}, {'vchscreennamesimple': 'caitest3'}]
            });
};

*/