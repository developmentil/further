var further = module.exports;

further.registery = require('./lib/registery');

further.Serial = require('./lib/tasks/serial');
further.Parallel = require('./lib/tasks/parallel');
further.Controller = require('./lib/controller');

further.setup = require('./lib/setup');
further.requires = require('./lib/requires');
further.require = require('./lib/require');
