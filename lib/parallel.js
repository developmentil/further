
module.exports = Parallel;

var push = function(self, callback, key) {
	var obj = {
		pos: self._callbacks.length,
		key: key,
		callback: callback,
		called: false,
		result: null
	};
	
	self._callbacks.push(obj);
	
	if(key && !self._isMap)
		self._isMap = true;
	
	// has error, nothing todo any more
	if(self._err)
		return;
	
	self._refCount++;
	callback.call(self, function(err) {
		if(obj.called) {
			err = new Error('Callback called more then once');
		} else {
			obj.called = true;
			self._refCount--;
		}
		
		if(err) {
			self._err = err;
			
			self.run();
			return;
		}
		
		obj.result = arguments.length <= 2 
			? arguments[0] 
			: Array.prototype.slice.call(arguments, 1);
			
		if(!self._refCount)
			self.run();
	});
};

function Parallel() {
	this._err = null;
	this._refCount = 0;
	this._runs = [];
	
	this._callbacks = [];
	this._isMap = false;
};

Parallel.prototype.push = function(key, callback) {
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

Serial.prototype.next = function(key) {
	var self = this,
	next = null;
	
	push(self, function(callback) {
		next = callback;
	}, key);
	
	return next;
};

Serial.prototype.run = function(callback) {
	var self = this;
	
	if(callback) {
		self._runs.push(callback);
	}
	
	if(self._refCount && !self._err)
		return this;
	
	var fns = self._runs,
	results = !self._isMap ? [] : {};
	self._runs = [];
	
	if(!self._err) {
		self._callbacks.forEach(function(obj) {
			if(obj.key)
				results[obj.key] = obj.result;
			else
				results[obj.pos] = obj.result;
		});
	}
	
	fns.forEach(function(fn) {
		fn.call(self, self._err, results);
	});
	
	return this;
};
