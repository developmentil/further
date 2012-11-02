var path = require('path'),
	
	registery = require('./registery');
	
module.exports = function(file) {
	if(registery.path) {
		if(!registery.path.push)
			file = path.resolve(registery.path, file);
		else {
			var paths = registery.path.slice();
			paths.push(file);
			
			file = path.resolve.apply(path, paths);
		}
	} else {
		file = path.resolve(file);
	}
	
	return require(file);
};

