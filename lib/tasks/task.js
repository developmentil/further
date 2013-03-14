var util = require("util"),
	EventEmitter = require("events").EventEmitter;

module.exports = Task;

function Task(job, parentTask) {
	Task.super_.call(this);
	
	this._onDone = null;
	this._results = null;
	this._job = job;
	this._parent = parentTask || null;
};
util.inherits(Task, EventEmitter);

Task.prototype.isRunning = function() {
	return (this._onDone !== null && this._onDone.length);
};

Task.prototype.done = function(callback) {
	if(this._onDone === null)
		throw new Error('Task wasn\'t run yet');
	
	if(this._onDone.length)
		this._onDone.push(callback);
	else
		callback.apply(this, this._results);
	
	return this;
};

Task.prototype.stop = function() {
	if(this.isRunning()) {
		this._results = [new Error('Task Stopped')];
		this.emit('stop', this._results[0]);
	}
	
	return this;
};

Task.prototype.run = function(callback) {
	if(this._onDone !== null) {
		return this.done(callback);
	}
	
	// add callback to done array
	this._onDone = [callback];
	
	// define a done strategy
	var self = this,
	done = function() {		
		self._results = Array.prototype.slice.call(arguments);
		
		var fns = self._onDone;
		self._onDone = [];

		fns.forEach(function(fn) {
			fn.apply(self, self._results);
		});

		// emit done event
		var args = ['done'];
		args.push.apply(args, self._results);
		self.emit.apply(self, args);
	};
	
	// run the job
	if(!this._parent) {
		this._job(done);
	} else {
		this._parent.done(function(err) {
			if(err) return done(err);
			
			self._job(done);
		});
	}
	
	return this;
};

