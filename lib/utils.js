
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
			map[v] = v;
		}

		for(i in map)
			ret.push(map[i]);

		return ret;
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