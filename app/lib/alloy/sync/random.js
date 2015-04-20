//
// randome.me sync adapter for using with Appcelerator Alloy
// built from baseline adapter for properties, we will only
// support GET/reading records for this example
function S4() {
	return (65536 * (1 + Math.random()) | 0).toString(16).substring(1);
}

function guid() {
	return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
}

function InitAdapter() {
}

function Sync(method, model, opts) {

	switch (method) {

	// only supporting READ, will use the people service
	// to get the data
	case "read":

		var peopleService = require('peopleService');

		peopleService.getPeople(function(_response) {
			// the data we need to return is the array of people
			var resp = _response.data.results;
			
			if (resp) {
				// we pass the array into success callback and 
				// the backbone framework will generate the collection
				// for us.
				_.isFunction(opts.success) && opts.success(resp);
				"read" === method && model.trigger("fetch");
			} else {
				_.isFunction(opts.error) && opts.error(resp);
			}
		});
		break;

	case "update":
	case "delete":
	case "create":
		break;
	}

}

var _ = require("alloy/underscore")._;

module.exports.sync = Sync;

module.exports.beforeModelCreate = function(config) {
	config = config || {};
	config.data = {};
	InitAdapter();
	return config;
};

module.exports.afterModelCreate = function(Model) {
	Model = Model || {};
	Model.prototype.config.Model = Model;
	return Model;
};
