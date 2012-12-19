var further = module.exports;

further.extend = require('./lib/extend');

further.reg = 
further.registery = require('./lib/registery');

further.Serial = require('./lib/tasks/serial');
further.Parallel = require('./lib/tasks/parallel');
further.Controller = require('./lib/controller');
further.Service = require('./lib/service');
further.HttpServer = require('./lib/httpServer');
further.HttpsServer = require('./lib/httpsServer');

further.setup = require('./lib/setup');
further.requires = require('./lib/requires');
further.require = require('./lib/require');
