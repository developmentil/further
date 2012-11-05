
module.exports = Serial;

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

function Serial() {
	this._callbacks = [];
	this._isMap = false;
};

Serial.prototype.push = function(key, callback) {
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
	next = function(err) {
		next = [this, arguments];
	};
	
	push(self, function(callback) {
		// callback not called yet
		if(typeof next === 'function')
			next = callback;
		else
			callback.apply(next[0], next[1]);
	}, key);
	
	return next;
};

Serial.prototype.run = function(callback) {
	var self = this,
	pos = 0,
	results = !this._isMap ? [] : {},
	lastResult = null,
	next = function() {
		if(pos >= self._callbacks.length) {
			callback(null, results);
			return;
		}
		
		var obj = self._callbacks[pos++];

		obj.callback.call(self, function(err) {
			if(obj.called) {
				err = new Error('Callback called more then once');
			} else {
				obj.called = true;
			}
			
			if(err) {
				callback(err);
				return;
			}

			lastResult = arguments.length <= 2 
				? arguments[0] 
				: Array.prototype.slice.call(arguments, 1);

			if(obj.key)
				results[obj.key] = lastResult;
			else
				results[obj.pos] = lastResult;

			next();
		}, lastResult);
	};
};
