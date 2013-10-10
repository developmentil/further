var further = require("../index"),
	Service = require("./service"),
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
		
		further.logger.log('info', self._serviceName + ' listening on port ' + 
			self.server.address().port);
		
		self.emit('listen');
		
		callback.apply(self, arguments);
	});
	
	further.logger.log('info', this._serviceName + ' started on port ' + this._port);
};

Server.prototype._stop = function(callback) {
	var self = this;
	
	this.server.close(function(err) {
		if(!err) {
			further.logger.log('info', self._serviceName + ' stopped on port ' + self._port);
		}
		
		callback.apply(self, arguments);
	});
};