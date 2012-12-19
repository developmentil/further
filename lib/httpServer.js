var Server = require("./server"),
	util = require("util"),
	http = require('http');


exports = module.exports = HttpServer;

function HttpServer(app, name) {
	this.app = app;
	
	HttpServer.super_.call(this, http.createServer(app), app.get('port') || 80, name || 'HTTP Server');
};
util.inherits(HttpServer, Server);