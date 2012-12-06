var util = require("util"),
	TaskContainer = require("./container");

module.exports = Serial;


function Serial(parentTask) {
	var self = this;
	
	Serial.super_.call(this, function(callback) {
		var pos = 0,
		results = !self._isMap ? [] : {},
		lastResult = null,

		next = function() {
			if(pos >= self._callbacks.length) {
				callback(null, results);
				return;
			}

			var obj = self._callbacks[pos++];

			obj.callback(function(err) {
				if(!obj.called) {
					obj.called = true;
				} else {
					callback(new Error('Callback(' + obj.pos + ') called more then once'));
					return;
				}

				if(err) {
					callback(err);
					return;
				}

				lastResult = arguments.length <= 2 
					? arguments[1] 
					: Array.prototype.slice.call(arguments, 1);

				if(obj.key)
					results[obj.key] = lastResult;
				else
					results[obj.pos] = lastResult;

				next();
			}, lastResult);
		};

		next();
	}, parentTask);
};
util.inherits(Serial, TaskContainer);