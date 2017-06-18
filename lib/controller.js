var further = require("../index");

/**
 * Expose Controller class
 */
module.exports = Controller;


// Holds any controller instance
var _controllers = [],
_controllersSorted = true;

function Controller(url, viewPath, priority) {
	this._prefixUrl = url || '';
	this._viewPath = viewPath || this._prefixUrl.substr(1);
	
	if(this._viewPath && this._viewPath.substr(-1) != '/')
		this._viewPath += '/';
	
	this._mapping = {
		get: {},
		post: {},
		put: {},
		delete: {},
		all: {}
	};
	
	this._tags = {};
	
	this._inits = [];
	this._befores = [];
	this._afters = [];
	this._params = [];
	
	this.priority = priority || 0;
	
	_controllersSorted = false;
	_controllers.push(this);
}

Controller.forEach = function(fn) {
	if(!_controllersSorted) {
		_controllers.sort(function(a, b) {
			return a.priority - b.priority;
		});
		_controllersSorted = true;
	}
	
	_controllers.forEach(fn);
};

Controller.prototype.url = function(url, req) {
	url = this._prefixUrl + (url || '/');

	if (this._prefixUrl.indexOf(':') !== -1 && req && req.params) {
		
		Object.keys(req.params).forEach(function(key) {
			url = url.replace(new RegExp(':' + key + '([?/]|$)'), function(match, p1) {
				return req.params[key] + p1;
			});
		});
	}
	
	return url;
};

Controller.prototype.view = function(path) {
	return this._viewPath + (path || '');
};

Controller.prototype.all = function(url, fn) {
	this.route('all', url, Array.prototype.slice.call(arguments, 1));
	return this;
};

Controller.prototype.get = function(url, fn) {
	this.route('get', url, Array.prototype.slice.call(arguments, 1));
	return this;
};

Controller.prototype.post = function(url, fn) {
	this.route('post', url, Array.prototype.slice.call(arguments, 1));
	return this;
};

Controller.prototype.put = function(url, fn) {
	this.route('put', url, Array.prototype.slice.call(arguments, 1));
	return this;
};

Controller.prototype.del = 
Controller.prototype['delete'] = function(url, fn) {
	this.route('delete', url, Array.prototype.slice.call(arguments, 1));
	return this;
};

Controller.prototype.route = function(method, url, fns) {
	if(!this._mapping[method])
		throw new Error('Invalid routing method');
	
	this._mapping[method][url] = fns;
	return this;
};

Controller.prototype.init = function(fn) {
	this._inits.push.apply(this._inits, arguments);
	return this;
};

Controller.prototype.before = function(fn) {
	this._befores.push.apply(this._befores, arguments);
	return this;
};

Controller.prototype.after = function(fn) {
	this._afters.push.apply(this._afters, arguments);
	return this;
};

Controller.prototype.param = function(name, fn) {
	this._params.push(arguments);
	return this;
};

Controller.prototype.tag = function(name, fn) {
	var self = this, 
	fns = Array.prototype.slice.call(arguments, 1);
	
	if(typeof name !== 'object')
		name = [name];
	
	name.forEach(function(tag) {
		if(typeof self._tags[tag] === 'undefined')
			self._tags[tag] = [];
		
		self._tags[tag].push.apply(self._tags[tag], fns);
	});
	return this;
};

Controller.prototype.middle = function() {
	var self = this;
	
	return function(req, res, next) {
		res.locals.controller = {
			req: req,
			view: function() {
				return self.view.apply(self, arguments);
			},
			url: function(url) {
				return self.url.call(self, url, req);
			}
		};
		
		return next();	
	};
};

Controller.prototype.setup = function(app) {
	var self = this, 
	prefixUrl = this._prefixUrl,
	middle = self.middle();
	
	this.app = app;
	
	for(var method in this._mapping) {
		for(var url in this._mapping[method]) {
			var fns = this._mapping[method][url],
			isBeforeAfter = fns[0],
			params = [prefixUrl + url, middle];
			
			if(!isBeforeAfter)
				fns = fns.slice(1);
			else 
				fns = this._befores.concat(fns, this._afters);
			
			// append callbacks
			var pushFns = function(fns) {
				fns.forEach(function(fn) {
					if(typeof fn !== 'string') {
						params.push(fn);
					} else {
						if(!self._tags[fn]) {
							further.logger.warn('Controller tag `' + fn 
									+ '` not found on: ' + method.toUpperCase() + ' ' + url);
							
							return;
						}

						pushFns(self._tags[fn]);
					}
				});
			};
			pushFns(fns);
			
			app[method].apply(app, params);
		}
	}
	
	this._inits.forEach(function(fn) {
		fn.apply(self, [app]);
	});
	
	this._params.forEach(function(args) {
		app.param.apply(app, args);
	});
	
	return this;
};