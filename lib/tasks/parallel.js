var util = require("util"),
	TaskContainer = require("./container");;
	
module.exports = Parallel;

var run = function(self) {
	self._callbacks.forEach(function(obj) {
		if(obj.called)
			return;
		
		obj.called = 1;
		obj.callback(function(err) {
			if(obj.called !== 1)
				throw new Error('Callback(' + obj.pos + ') called more then once');
			
			obj.called = true;
			self._refCount--;

			if(!err) {
				obj.result = arguments.length <= 2 
					? arguments[1] 
					: Array.prototype.slice.call(arguments, 1);
			} else if(!self._err) {
				self._err = err;
			}
			
			if(!self._refCount) {
				self._jobCallback();
			}
		});
	});
};


function Parallel(parentTask) {
	var self = this;
	
	this._err = null;
	this._refCount = 0;
	this._jobCallback = null;
	
	Parallel.super_.call(this, function(callback) {
		self._jobCallback = function() {
			var results = !self._isMap ? [] : {};
			
			if(!self._err) {
				self._callbacks.forEach(function(obj) {
					if(obj.key)
						results[obj.key] = obj.result;
					else
						results[obj.pos] = obj.result;
				});
			}

			callback(self._err, results);
		};
		
		run(self);
		
		if(!self._refCount) {
			self._jobCallback();
		}
	}, parentTask);
};
util.inherits(Parallel, TaskContainer);


Parallel.prototype.push = function() {
	var count = this._callbacks.length;
	
	Parallel.super_.prototype.push.apply(this, arguments);
	
	this._refCount += this._callbacks.length - count;
	
	if(this._jobCallback !== null) {
		run(this);
	}
	
	return this;
};
