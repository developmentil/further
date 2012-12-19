var EventEmitter = require('events').EventEmitter,
	util = require('util'),
	
	STATUS_INIT = 0,
	STATUS_INITED = 1,
	STATUS_STOP = STATUS_INITED,
	STATUS_START = 2 | STATUS_INITED,
	STATUS_BUSY = 4,
	STATUS_STARTING = STATUS_BUSY | STATUS_STOP,
	STATUS_STOPING = STATUS_BUSY | STATUS_START;

// Expose `Service`
exports = module.exports = Service;


function Service(name) {
	Service.super_.call(this);
	
	this._status = STATUS_INIT;
	this._serviceName = name;
	this._onIdle = [];
};
util.inherits(Service, EventEmitter);


Service.prototype.isStart = function() {
	return ((this._status & STATUS_START) === STATUS_START);
};

Service.prototype.isBusy = function() {
	return ((this._status & STATUS_BUSY) === STATUS_BUSY);
};


Service.prototype.start = function(callback) {
	if(this.isStart()) {
		if(typeof callback === "function")
			callback.call(this, null);
		return this;
	}
	
	var self = this;
	
	this.onIdle(function() {
		if(self._serviceName)
			console.log(self._serviceName + ': Starting Service...');
		
		self.emit('start');
	
		var myCallback = self.setBusy(STATUS_STARTING, function(err) {
			if(err) {
				if(typeof callback === "function")
					callback.apply(this, arguments);
				return;
			}
	
			if(self._serviceName)
				console.log(self._serviceName + ': Service Started.');
			
			self._status = STATUS_START;
			self.emit('start.post');
			
			if(typeof callback === "function")
				callback.apply(this, arguments);	
		});
		
		self._start(myCallback);
	});
	
	return this;
};

Service.prototype._start = function(callback) {
	callback.call(this, null);
};


Service.prototype.stop = function(callback) {
	if(!this.isStart()) {
		if(typeof callback === "function")
			callback.call(this, null);
		return this;
	}
	
	var self = this;

	this.onIdle(function() {
		if(self._serviceName)
			console.log(self._serviceName + ': Stopping Service...');
		
		self.emit('stop');
		
		var myCallback = self.setBusy(STATUS_STOPING, function(err) {
			if(err) {
				if(typeof callback === "function")
					callback.apply(this, arguments);
				return;
			}
	
			if(self._serviceName)
				console.log(self._serviceName + ': Service Stopped.');
			
			self._status = STATUS_STOP;
			self.emit('stop.post');
			
			if(typeof callback === "function")
				callback.apply(this, arguments);
		});
		
		self._stop(myCallback);
	});
	
	return this;
};

Service.prototype._stop = function(callback) {
	callback.call(this, null);
};

Service.prototype.setBusy = function(status, callback) {
	var oldStatus = this._status,
	newStatus = status || STATUS_BUSY,
	self = this,
	
	myCallback = function() {
		if(self._status === newStatus)
			self._status = oldStatus;
		
		util.debug(self._serviceName + ': Service set as idle (' + self._status + ')');
		
		
		// emit 'busy.release' event
		var args = Array.prototype.slice.apply(arguments);
		args.unshift('busy.release');
		self.emit.apply(self, args);
		
		if(typeof callback === "function")
			callback.apply(self, arguments);
		
		// call on idle funcs
		while(self._onIdle.length > 0) {
			if(self.isBusy())
				return;
			
			self._onIdle.shift().apply(arguments);
		}
	};
	
	this._status = newStatus;
	util.debug(this._serviceName + ': Service set as busy (' + this._status + ')');
	this.emit('busy');	
	
	return myCallback;
};

Service.prototype.onIdle = function(callback) {
	if(!this.isBusy()) {
		callback.call(this, null);
		return this;
	}
	
	this._onIdle.push(callback);
	return this;
};


Service.prototype.restart = function(callback) {
	this.emit('restart');
	
	var self = this,
	start = function() {
		self.emit('restart.pre');
		self.start(function(err) {
			if(!err) {			
				self.emit('restart.post');
			}
			
			if(typeof callback === "function")
				callback.apply(self, arguments);
		});
	};
	
	if(this.isStart()) {
		this.stop(start);
	} else {
		start();
	}
	
	return this;
};


Service.queue = function(queue, callback) {
	var self = this,
	myCallback = function(err) {
		if(err || queue.length < 1) {
			callback.apply(self, arguments);
			return;
		}
		
		var next = queue.shift(),
		service = next[0], method = service[next[1]];
		
		method.apply(service, [myCallback]);
	}
	
	myCallback(null);
};