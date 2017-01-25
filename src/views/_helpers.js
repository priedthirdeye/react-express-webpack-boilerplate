var moment = require('moment');
var hbs = require('hbs');
var http = require('http');

global.Promise = require('bluebird');
//var promisedHandlebars = require('promised-handlebars');
//var hbsSync = promisedHandlebars(require('handlebars'));
//var httpGet = require('get-promise');


let Helpers = function() {

	function conditionalEvaluator(a, operator, b) {
		var bool = false;
		if (b) {
			a = a.toString().toLowerCase();
			b = b.toString().toLowerCase();
			switch (operator) {
				case 'EQ':
					if (b.indexOf('*') === -1) {
						bool = a == b;
					} else {
						bool = a.indexOf(b.replace('*', '')) === 0;
					}					
					break;
				case 'GT':
					bool = a > b;
					break;
				case 'GE':
					bool = a >= b;
					break;
				case 'LT':
					bool = a < b;
					break;
				case 'LE':
					bool = a <= b;
					break;
				case 'CT':
					bool = a.match(b);
					break;
				default:
					throw new Error('Unknown operator ' + operator);
			}
		} else {
			bool = a;
		}
		return bool;
	}

	hbs.registerHelper('if', function(a, operator, b, opts) {
		if (!b) {
			opts = arguments[1];
		}
		var bool = conditionalEvaluator(a, operator, b);
		if (bool) {
			return opts.fn(this);
		} else {
			return opts.inverse(this);
		}
	});

	hbs.registerHelper("switch", function(value, options) {
		this._switch_value_ = value;
		var html = options.fn(this); // Process the body of the switch block
		delete this._switch_value_;
		return html;
	});

	hbs.registerHelper('debugTable', function(options) {                   
		var obj = options.data.root;
		var tableData = ['<table border="1" cellpadding="5">']; 
		for (var prop in obj) {
			tableData.push('<tr><td>' + prop + '</td>');
			tableData.push('<td style="width:100%">' + (typeof obj[prop] === 'string' ? obj[prop] : obj[prop].length) + '</td>');
			tableData.push('</tr>');			
		}
		tableData.push('</table>');
		return tableData.join(''); 
	});	

	hbs.registerHelper('case', function(operator, b, opts) {
		if (this._exit_switch_) {
			return;
		}
		if (arguments.length === 2) {
			opts = arguments[1];
			b = arguments[0];
			operator = 'EQ';
		} else if (arguments.length === 1) {
			opts = arguments[0];
		}
		if (conditionalEvaluator(this._switch_value_, operator, b)) {
			this._exit_switch_ = true;
			return opts.fn(this);
		}
	});

	hbs.registerHelper('timestamp', (text, options) => {
		return moment(text).format('DD/MM/YYYY');
	});
	hbs.registerHelper('getJSON', function() {
		var args = [],
			options = arguments[arguments.length - 1];
		for (var i = 0; i < arguments.length - 1; i++) {
			args.push(arguments[i]);
		}

		return options.fn(this, {
			data: options.data,
			blockParams: args
		});
	});
	hbs.registerHelper('setVars', function(options) {
		return options.fn({
			appResponse: 't'
		});
	});

	hbs.registerAsyncHelper('sendHttpRequest', (url, options, callback) => {

		http.get(url, (res) => {
			const statusCode = res.statusCode;
			//const contentType = res.headers['content-type'];

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
					data.index = 'OK1';
					options.data.root.appHTTPResponse = 'OK';
					//return options.fn({ appHTTPResponse: 'OK' });
					callback(rawData, {
						appResponse: 't'
					});
				} catch (e) {
					console.log(e.message);
				}
			});
		}).on('error', (e) => {
			options.data.root.appHTTPResponse = 'ERROR';
			console.log(`Got error: ${e.message}`);
		});
	});

	hbs.registerHelper('gsendmsg', function () {
		var nodemailer = require('nodemailer');
		var smtpTransport = require('nodemailer-smtp-transport');
		var transporter = nodemailer.createTransport(smtpTransport({
			service: 'gmail',
			auth: {
				user: 'mikepuglisi@gmail.com', // my mail
				pass: 'charlie#1'
			}
		}));
		// create reusable transporter object using the default SMTP transport
		// var transporter = nodemailer.createTransport('smtps://mikepuglisi%40gmail.com:charlie#1@smtp.gmail.com');
		// setup e-mail data with unicode symbols
		var mailOptions = {
			from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
			to: 'mikepuglisi@gmail.com, mikepuglisi@gmail.com', // list of receivers
			subject: 'Hello ✔', // Subject line
			text: 'Hello world 🐴', // plaintext body
			html: '<b>Hello world 🐴</b>' // html body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info) {
			if (error) {
				return console.log(error);
			}
			console.log('Message sent: ' + info.response);
		});
	});
}

module.exports = new Helpers();
