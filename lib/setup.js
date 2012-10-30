var Controller = require('./controller');

/**
 * Expose setup method
 */
module.exports = setup;


var setup = function(options) {
	if(options.app) {
		setupApp(options.app);
	}
},

setupApp = function(app) {
	Controller.forEach(function(controller) {
		controller.setup(app);
	});
};

