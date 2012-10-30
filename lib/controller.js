
/**
 * Expose Controller class
 */
module.exports = Controller;

// Holds any controller instance
var _controllers = [],

Controller = function(url, viewPath) {
	this._prefixUrl = url || '';
	this._viewPath = viewPath || this._prefixUrl.substr(1);
	
	this._mapping = {
		get: {},
		post: {},
		put: {},
		'delete': {}
	};
	
	this._tags = {};
	
	this._inits = [];
	this._befores = [];
	this._afters = [];
	this._params = [];
	
	_controllers.push(this);
};

Controller.forEach = function(fn) {
	_controllers.forEach(fn);
};

Controller.prototype.url = function(url, req) {
	url = this._prefixUrl + (url || '/');
	
	if(req && req.route && req.route.keys.length) {
		
		req.route.keys.forEach(function(key) {
			if(!req.route.params[key.name])
				return;
			
			url = url.replace(new RegExp(':' + key.name + '([?/]|$)'), function(match, p1) {
				return req.route.params[key.name] + p1;			
			});
		});
	}
	
	return url;
};

Controller.prototype.view = function(path) {
	return this._viewPath + (path || '');
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
	this._inits.push(fn);
	return this;
};

Controller.prototype.before = function(fn) {
	this._befores.push(fn);
	return this;
};

Controller.prototype.after = function(fn) {
	this._afters.push(fn);
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
			
			if(isBeforeAfter)
				params = params.concat(this._befores);
			
			// append callbacks
			fns.forEach(function(fn) {
				if(typeof fn !== 'string') {
					params.push(fn);
				} else {
					if(!self._tags[fn])
						return;
					
					params = params.concat(self._tags[fn]);
				}
			});
			
			if(isBeforeAfter)
				params = params.concat(this._afters);
			
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