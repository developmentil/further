var Service = require("./service"),
	util = require("util");


exports = module.exports = Server;

function Server(name, server, port, host, backlog) {
	Server.super_.call(this, name || 'Server');

	this.server = server;
	this._port = port;
	this._host = host || '0.0.0.0';
	this._backlog = backlog || 511;
};
util.inherits(Server, Service);

Server.prototype._start = function(callback) {
	var self = this;
	
	this.server.listen(this._port, this._host, this._backlog, function(err){
		if(err) {
			callback.apply(self, arguments);
			return;
		}
		
		console.log(self._serviceName + ' listening on port %d in %s mode', 
			self.server.address().port, self.server.settings.env);
		
		self.emit('listen');
		
		callback.apply(self, arguments);
	});
	
	console.log(this._serviceName + ' started on port %d', this._port);
};

Server.prototype._stop = function(callback) {
	var self = this;
	
	this.server.close(function(err) {
		if(!err) {
			console.log(self._serviceName + ' stopped on port %d', self._port);
		}
		
		callback.apply(self, arguments);
	});
};