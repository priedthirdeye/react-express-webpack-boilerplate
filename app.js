require('dotenv').config();
var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('hbs');
var hbsutils = require('hbs-utils')(hbs);
require('./src/views/_helpers');

var responseTime = require('response-time');


//routes
var routes = require('./src/routes/index');

/*
var NodeCache = require('cache-service-node-cache');
var cacheModuleConfig = {defaultExpiration: 60};
var nodeCache = new NodeCache(cacheModuleConfig);


function formatDate(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return date.getMonth()+1 + "/" + date.getDate() + "/" + date.getFullYear() + "  " + strTime;
}

function goGetData() {
    console.log(formatDate(new Date()));
    return { 'ts': formatDate(new Date()) };
  
}

var refresh = function(key, cb) {
  var response = goGetData();
  cb(null, response);
}

nodeCache.set('livehosts', goGetData(), 1 , refresh, function (err, result) { 
        nodeCache.get('livehosts', function (err, response){
            console.log('livehosts=', response);
        });    
});

*/
//var router = express.Router();

var app = express();
//app.enable('view cache');
app.use(responseTime());
hbs.registerPartials(__dirname + '/src/views/partials');
hbsutils.registerWatchedPartials(__dirname + '/src/views/partials');
// view engine setup
app.set('views', path.join(__dirname, '/src/views'));
app.set('view engine', 'hbs');

//var twrp = require('./middleware/twrp')(app);
//app.use(twrp.buildRoutes);

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/*
app.use(function(req, res, next) {
  if (req.url.indexOf('?') > -1) {
    if (req.url.indexOf('/?') === -1) {
      res.redirect(301, req.url.replace('?', '/?'));
    } 
    next();
  } else if (req.url.substr(-1) !== '/' && req.url.length > 1) {
    res.redirect(301, req.url + '/');
  } else {
    next();
  }
});
*/

//var routeData = require('./src/data/routes');
//for (var i = 0, len = routeData.length; i < len; i++) {
   // var route = routeData[i].route;
    //console.log(route);
 //   app.use(route, require('./src/controllers/' + routeData[i].controller));
//}

//app.use('/cams', require('./src/controllers/livehosts'));
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
