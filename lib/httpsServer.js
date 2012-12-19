var Server = require("./server"),
	util = require("util"),
	https = require('https');


exports = module.exports = HttpsServer;

function HttpsServer(options, app, name) {
	this.app = app;
	
	HttpsServer.super_.call(this, https.createServer(options, app), app.get('port') || 443, name || 'HTTP Server');
};
util.inherits(HttpsServer, Server);