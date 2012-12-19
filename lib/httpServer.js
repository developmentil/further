var Server = require("./server"),
	util = require("util"),
	http = require('http');


exports = module.exports = HttpServer;

function HttpServer(app, name) {
	this.app = app;
	
	HttpServer.super_.call(this,
		name || 'HTTP Server',
		http.createServer(app),
		app.get('port') || 80
	);
};
util.inherits(HttpServer, Server);