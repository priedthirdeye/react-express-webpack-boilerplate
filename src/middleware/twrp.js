var router;
module.exports = function(setup_router) {
    if (setup_router) {
        router = setup_router;
    }
    console.log('router', router);
    return module.exports;
};

module.exports.buildRoutes = function(req,res,next) {
    if (!router) {
        throw new Error("Can't use method1 until io is properly initalized");
    }
    console.log('buildroutes');
	console.log('buildroutes', router);
    router.get('/activityfeed' , function(req,res,next){
    	console.log('activityfeed');
    	next();
    });
    next();
};