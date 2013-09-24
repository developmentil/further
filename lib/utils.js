
var self = 
module.exports = {
	
	SPECIAL_CHARS: /[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi,
	REGEXP_CHARS: /[-\/\\^$*+?.()|[\]{}]/g,
	
	noop: function() {},
	
	logger: console,
	
	werr: function(werr) {
		if(werr) this.logger.warn(werr);
	},
	
	unique: function(arr) {
		var map = {}, ret = [], i, v;

		for(i = 0; i < arr.length; i++) {
			v = arr[i];
			map[JSON.stringify(v)] = v;
		}

		for(i in map)
			ret.push(map[i]);

		return ret;
	},
	
	// Return a random integer between min and max (inclusive).
	// [Underscore random](https://github.com/jashkenas/underscore/blob/master/underscore.js).
	random: function(min, max) {
		if (max === undefined) {
			max = min;
			min = 0;
		}
		
		return min + Math.floor(Math.random() * (max - min + 1));
	},
	
	// Shuffle an array, using the modern version of the
	// [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
	shuffle: function(obj) {
		var rand;
		var index = 0;
		var shuffled = [];
		
		obj.forEach(function(value) {
			rand = self.random(index++);
			shuffled[index - 1] = shuffled[rand];
			shuffled[rand] = value;
		});
		
		return shuffled;
	},
	
	// Produce an array that contains the union: each distinct element from all of
	// the passed-in arrays.
	// [Underscore union](https://github.com/jashkenas/underscore/blob/master/underscore.js).
	union: function(obj) {
		return self.unique(self.flatten(arguments, true));
	},			
	
	// Flatten out an array, either recursively (by default), or just one level.
	// [Underscore flatten](https://github.com/jashkenas/underscore/blob/master/underscore.js).
	flatten: function(input, shallow, output) {
		if(!output) output = [];
		
		if (shallow && Array.prototype.every.call(input, Array.isArray)) {
			return output.concat.apply(output, input);
		}
		
		 Array.prototype.forEach.call(input, function(value) {
			if (Array.isArray(value)) {
				shallow ? output.push.apply(output, value) : self.flatten(value, shallow, output);
			} else {
				output.push(value);
			}
		});
		
		return output;
	},
			
	// Take the difference between one array and a number of other arrays.
	// Only the elements present in just the first array will remain.
	difference: function(array) {
		var rest = self.flatten(Array.prototype.slice.call(arguments, 1), true);
		
		return array.filter(function(value) {
			return (rest.indexOf(value) === -1);
		});
	},
	
	trim: function(str) {
		return str.replace(/^\s+|\s+$/gi, '');
	},
			
	escapeRegExp: function(str) {
		return str.replace(self.REGEXP_CHARS, '\\$&');
	},
			
	htmlToText: function(html) {
		var encoder = new Encoder('entity');

		// Convert <br /> to new line
		html = html.replace(/<\s*br\/*>/gi, "\n");

		// Stripping the legal HTML tags
		html = html.replace(/<[^>]*>/g, '');

		// HTML chars
		html = encoder.htmlDecode(html);

		// Remove double space
		html = html.replace(/ {2,}/gi, ' ');

		// Remove double new lines
		html = html.replace(/\n+\s*/gi, "\n\n");

		// Trim
		html = html.replace(/^\s+|\s+$/gi, '');

		return html;
	}
};