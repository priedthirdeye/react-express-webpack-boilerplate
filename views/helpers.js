var moment = require("moment");
var hbs = require('hbs');

let helpers = function () {

	hbs.registerHelper('timestamp', (text, options) => {
		return moment(text).format("DD/MM/YYYY");
	});
}

module.exports = new helpers();  