/*const sql = require('mssql');
const cp = require('../database/get-connection')();

var cacheManager = require('cache-manager');
var redisStore = require('cache-manager-redis');

var redisCache = cacheManager.caching({
    store: redisStore,
    host: 'localhost', // default value
    port: 6379, // default value
    auth_pass: '',
    db: 0,
    ttl: 600
});

var ttl = 60; 

function getProjectRegistry(id, cb) {
        cp.then(
            function(conn) {
                new sql.Request(conn)                
                .query`SELECT rtrim(lower(prappcode)) as prappcode, rtrim(prkey) as prkey, rtrim(prvalue) as prvalue from [IFTmplWraper].[dbo].[ProjectRegistry]`.then(function (recordsets) {   
                    var groups = _.groupBy(recordsets, 'prappcode');
                    // loops through each twrP appcode "group" once e.g. TWRP_ActivityFeed, twrp_badges, etc.
                    for (let [key, appData] of Object.entries(groups)) {                                                     
                        groups[key] = _.transform(appData, function(result, obj, key) {
                                                                result[obj.prkey.toLowerCase()] = obj.prvalue;                                                
                                                            }, {});   
                    }
                    cb(null, groups);           
                }).catch(function(err) {
                    console.log('err', err);
                });  
            },
            function(err) {
                console.error(err);
                process.exit(666);
            }
        );
        
}

//var userId = 123;
//var key = 'user_' + userId;

// Note: ttl is optional in wrap()
redisCache.wrap('wp:project-registry', function(cb) {
    getProjectRegistry('project-registry', cb);
}, { ttl: ttl}, function (err, projectRegistry) {
    console.log(projectRegistry['twrp_activityfeed']);
});*/
