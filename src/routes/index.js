const express = require('express');

const router = express.Router();

const routes = require('../data/routes');
const vchVariables = require('../middleware/vch-variables');
const mbrVariables = require('../middleware/mbr-variables');
const _ = require('lodash');

const sql = require('mssql');
const cp = require('../database/get-connection')();

router.use(vchVariables);
router.use(mbrVariables);
router.use(function(req, res, next) {
    let pParams = {};
    Object.keys(req.query).forEach(function(key, index) {        
        if ((key.toLowerCase().indexOf('p') === 0)) {                     
            pParams[key.toLowerCase()] = req.query[key];          
        }        
    });
    res.locals = Object.assign({}, res.locals, pParams);

    next();
});
//require('./dynamic-routes')();

//var _ = require('lodash');



//custom middleware
//router.use(twrp());
//router.use(vchVariables());


cp.then(
    function(conn) {
        //do something with connection
        new sql.Request(conn)                
        .query`SELECT rtrim(lower(prappcode)) as prappcode, rtrim(prkey) as prkey, rtrim(prvalue) as prvalue from [IFTmplWraper].[dbo].[ProjectRegistry] where prappcode IN (SELECT [PrAppCode] FROM [IFTmplWraper].[dbo].[ProjectRegistry] where prkey = 'route')`.then(function (recordsets) {   

            //var filtered = _.filter(recordsets, { 'prkey': 'Route' });
            //console.log(filtered);

            // group by appcode 
            var group = _.groupBy(recordsets, 'prappcode');                 
                      
            // loops through each twrP appcode "group" once e.g. TWRP_ActivityFeed, twrp_badges, etc.
            for (let [key, appData] of Object.entries(group)) {
                /*
                //Gets the sp_names_ from which we will add to the base route. e.g /badges/
                let modes = _.filter(appData, function(record) {
                    return record.prkey.indexOf('sp_name_') === 0;
                });
                console.log(modes);
                */

               //console.log(appData);     
/*
                //array of single objects
                var transformed = _.transform(appData, function(result, n) {
                                                        let o = {};
                                                        o[n.prkey] = n.prvalue;
                                                        result.push(o);
                                                        return true;
                                                    }, []);      
*/                                                    
                //console.log(transformed);    
                //transform data into object[key] = value data structure                                                         
                var prData = _.transform(appData, function(result, obj, key) {
                                                    result[obj.prkey.toLowerCase()] = obj.prvalue;                                                
                                                    }, {});   
                console.log(key);             
               //let route = _.find(appData, { 'prkey': 'route'}).prvalue;
               
               router.get('/' + prData.route, require('../controllers/' + (key.indexOf('livehosts') === 0 ? 'livehosts' : 'twrp'))(prData)); 

            }



            //console.log(group.TWRP_ActivityFeed); 
           // _.find(users, { 'age': 1, 'active': true });

            /*  
            for (var i = 0, len = recordsets.length; i < len; i++) {
                let routeData = {
                    'route': recordsets[i].prValue,
                    't': 'site/customersonly/activityfeed/main',
                    'controller': 'twrp'
                };        
                console.log(routeData);          
                console.log(recordsets[i]);
                router.get('/' + routeData.route, require('../controllers/twrp')(routeData));
            }       
            */               
        }).catch(function(err) {
            console.log('err', err);
        });  
    },
    function(err) {
        console.error(err);
        process.exit(666);
    }
);


 

//console.log('routes', routes);

for (var i = 0, len = routes.length; i < len; i++) {
   // var t = routes[i].t;
    //require('../controllers/livehosts')(routes[i]);
  //  let routeData = routes[i];

   // router.get('/' + routeData.route + '/:a?/:b?/:c?/:d?/:e?/', require('../controllers/livehosts')(routeData));

    /*
    let routeData = routes[i];
    let t = routeData.t;    
    console.log(t);
    console.log('/' + routeData.route + '/:a?/:b?/:c?/:d?/:e?/');

    router.get('/' + routeData.route + '/:a?/:b?/:c?/:d?/:e?/', function(req, res, next) {       
        console.log(req.params);     
        console.log(t);    
            var parameterObj = transformParameters(req.params);
            
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
    });    
    */
    //router.get('/' + routes[i].route + '/:a?/:b?/:c?/:d?/:e?/', require('../controllers/livehosts')(t).get);
    
    /*
    router.get('/' + routes[i].route + '/:a?/:b?/:c?/:d?/:e?/', (req, res, next) => {            
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
    });
    */
}


// Gets parameters from a route and transforms them based on value matches in a separate data store.
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
router.get('/cams/:a?/:b?/:c?/:d?/:e?/', (req, res, next) => {
       console.log(req.params);
        var parameterObj = transformParameters(req.params);
        console.log(parameterObj);
        res.render('site/navigation/livesessions/livebrowse/main', {
            title: "req.params.model",
            hasAccess: true,
            total: 3,
            route: req.url,
            params: JSON.stringify(req.params),
            transformed: JSON.stringify(parameterObj),
            color: 'orange'
    });
});

*/
/*
var arrAppCodes = ['twrp_activityfeed', 'twrp_badges'];
for (var i = 0, len = arrAppCodes.len; i < len; i++) {
    var route = arrAppCodes[i].replace('twrp_', '');
    router.get('/' + route, (req, res, next) => {
        console.log('url', req.url);
        res.render('index', {
            title: route,
            content: {}
        });
    });
}

*/


/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'iFriends.net',
        hasAccess: true,
        total: 3,
        color: 'orange'
    });
});

router.get('/cam/:model', function(req, res, next) {
  console.log('url', req.url);
  console.log('model', req.params.model);    
    res.render('index', {
        title: req.params.model,
        hasAccess: true,
        total: 3,
        route: req.url,
        params: req.params,
        color: 'orange'
    });
});

/*
router.get('/:dynamicRoute*', function(req, res, next) {
  console.log('in', req.url.substr(1));
  console.log('dynamicRoute', req.params.dynamicRoute);
  var path = req.url.substr(1, (req.url.indexOf('?') > 0 ? req.url.indexOf('?') - 1 : req.url.length));
  console.log((path.substring(0, path.length - 1)));
  res.render(path.substring(0, path.length - 1), {
        title: req.params.model,
        hasAccess: true,
        total: 3,
        route: req.url,
        params: JSON.stringify(req.params),
        color: 'orange'
    });
});
*/

module.exports = router;
