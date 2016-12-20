var express = require('express');
var router = express.Router();


var arrAppCodes = ['twrp_activityfeed', 'twrp_badges'];
for(var i=0,len=arrAppCodes.len; i<arrAppCodes.length;i++){
  var route = arrAppCodes[i].replace('twrp_','');
  router.get('/' + route, (req,res,next) =>  {
    console.log('url', req.url); 
    res.render('index' , {
        title: route,
        content: { }
    });
  });  
}



/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', {
        title: 'iFriends.net',
        content: { }
    });
});

module.exports = router;
