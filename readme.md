[further.js](https://npmjs.org/package/further)
==========

A lightweight library on Node.js

Install
=======

	$ npm install further

Simple Usage
=====

```js
var further = require('further'),
	app = express();

// Route "GET /"
app.get('/', function(req, res){
  res.send('Hello World');
});

// Route "POST /submit"
app.post('/submit', function(req, res) {
  res.send(req.body);
});

// Create an example controller
var controller = new further.Controller('/admin');

// Add a middleware before each controller request
controller.before(function(req, res, next) {
  req.user = 'UserObject';
  next();
});

// Define a routing tag
controller.tag('requireLogin', function(req, res, next) {
  if(!req.user) {
    next(new Error("Login Required!");
    return;
  }
  
  next();
});

// route "GET admin/" and require login!
controller.get('/', 'requireLogin', function(req, res) {
  res.send('Hello Admin');
});

// route "GET admin/login"
controller.get('/login', function(req, res) {
  res.send('Please Login');
});

// route "POST admin/login"
controller.post('/login', function(req, res) {
  res.send(req.body);
});

// Bind the controller routes
further.setup({
	app: app
});

// Start the application
app.listen(3000);
```


Changelog
=========

### 0.1.0

Initial release

License
=======

further.js is freely distributable under the terms of the MIT license.

Copyright (c) 2012 Moshe Simantov

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
