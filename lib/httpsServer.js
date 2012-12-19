var Server = require("./server"),
	util = require("util"),
	https = require('https');


exports = module.exports = HttpsServer;

function HttpsServer(options, app, name) {
	this.app = app;
	
	HttpsServer.super_.call(this,
		name || 'HTTP Server',
		https.createServer(options, app),
		app.get('port ssl') || 443
	);
};
util.inherits(HttpsServer, Server);