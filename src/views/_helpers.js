var moment = require("moment");
var hbs = require('hbs');
var http = require('http');

global.Promise = require('bluebird')
var promisedHandlebars = require('promised-handlebars')
var hbsSync = promisedHandlebars(require('handlebars'))
var httpGet = require('get-promise')







let helpers = function () {

	hbs.registerHelper('timestamp', (text, options) => {
		return moment(text).format("DD/MM/YYYY");
	});
	hbs.registerHelper('getJSON', function() {
		var args = [],
			options = arguments[arguments.length - 1];
		for (var i = 0; i < arguments.length - 1; i++) {
			args.push(arguments[i]);
		}

		return options.fn(this, {data: options.data, blockParams: args});
	});		
	hbs.registerHelper('setVars', function(options) {
		return options.fn({appResponse: 't'});
	});	

	hbs.registerAsyncHelper('sendHttpRequest', (url, options, callback) => {

		http.get(url, (res) => {
			const statusCode = res.statusCode;
			const contentType = res.headers['content-type'];

			let error;
			if (statusCode !== 200) {
				error = new Error(`Request Failed.\n` +
								`Status Code: ${statusCode}`);
			} 
			if (error) {
				console.log(error.message);
				// consume response data to free up memory
				res.resume();
				return;
			}

			res.setEncoding('utf8');
			let rawData = '';
			res.on('data', (chunk) => rawData += chunk);
			res.on('end', () => {
				
				try {
					//console.log(hbs.handlebars.createFrame);
					data = hbs.handlebars.createFrame(options.data);
					data.index='OK1';
					options.data.root.appHTTPResponse = 'OK';
					//return options.fn({ appHTTPResponse: 'OK' });
					callback(rawData, {appResponse: 't'});
				} catch (e) {
					console.log(e.message);
				}
			});
		}).on('error', (e) => {
			options.data.root.appHTTPResponse = 'ERROR';
			console.log(`Got error: ${e.message}`);
		});
		
		
	});

	// A block helper (retrieve github.com user data for a given username)
	// Execute the helper-block with the user data when it resolves
	hbsSync.registerHelper('githubuser', function (value, options) {
	var url = 'https://api.github.com/users/' + value
	return httpGet(url, { headers: { 'User-Agent': 'Node' } })
		.get('data')
		.then(JSON.parse)
		.then(function (data) {
		// `options.fn` returns a promise. Wrapping brackets must be added after resolving
		return options.fn(data)
		})
	})	

}

module.exports = new helpers();  