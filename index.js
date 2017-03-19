var Api = require("./libs/RestApiScaffold.js");
var log = require("./libs/log.js");

log.logDebug = true;

var api = new Api();
var models = require("./models.js");

require("./apiMeta.js").init(api, models);
require("./apiExercises.js").init(api, models);

api.start(8888);

log.log('started.');


