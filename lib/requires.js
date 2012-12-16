var path = require('path'),
	fs = require('fs'),
	
	registery = require('./registery');
	
module.exports = function(paths, recursive) {
	if(typeof paths !== 'object')
		paths = [paths];
	else
		paths = paths.slice();
	
	var results = {};
	
	while(paths.length) {
		var currPath = paths.shift();
		
		if(registery.path) {
			if(!registery.path.push)
				currPath = path.resolve(registery.path, currPath);
			else {
				var paths = registery.path.slice();
				paths.push(currPath);

				currPath = path.resolve.apply(path, paths);
			}
		} else {
			currPath = path.resolve(currPath);
		}
		
		fs.readdirSync(currPath).forEach(function(file) {
			file = path.join(currPath, file);
					
			var stat = fs.statSync(file);
						
			if (stat.isDirectory()) {
				if(recursive)
					paths.push(file);
			} else {
				if(file.substr(-3) === '.js')
					results[file] = require(file);
			}
		});
	}

	return results;
};

