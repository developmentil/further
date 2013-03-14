var util = require("util"),
	Task = require("./task");

module.exports = Container;

var push = function(self, callback, key) {
	var obj = {
		pos: self._callbacks.length,
		key: key,
		callback: callback,
		called: false
	};
	
	self._callbacks.push(obj);
	
	if(key && !self._isMap)
		self._isMap = true;
};


function Container() {
	Container.super_.apply(this, arguments);
	
	this._callbacks = [];
	this._isMap = false;
};
util.inherits(Container, Task);


Container.prototype.push = function(key, callback) {
	if((this._onDone !== null && !this._onDone.length)) {
		throw new Error('Task already ran');
	}
	
	var self = this;
	
	if(typeof key === 'function') {
		
		for(var i = 0; i < arguments.length; i++) {
			push(self, arguments[i]);
		}
		
	} else if(typeof key === 'string') {
		
		push(self, callback, key);
		
	} else if(typeof key === 'object') {
		
		Object.keys(key).forEach(function(k) {
			push(self, key[k], k);
		});
		
	}
	
	return this;
};


Container.prototype.next = function(key, returns) {
	var cb = null,
	next = function() {
		if(typeof cb === 'function') {
			// callback already called
			cb.apply(this, arguments);
		} else if(cb === null) {
			// update cb for callback
			cb = [this, arguments];
		} else {
			throw new Error('`next` callback already called.');
		}
		
		return returns;
	},
	
	fn = function(callback) {
		if(Array.isArray(cb)) {
			// next already called
			callback.apply(cb[0], cb[1]);
		} else if(cb === null) {
			// update cb for next
			cb = callback;
		} else {
			throw new Error('function already called.');
		}
	};
	
	if(typeof key !== 'string')
		this.push(fn);
	else
		this.push(key, fn);
	
	return next;
};
