var Pipeline = require('./pipeliner.js');
var http = require("http");
var log = require("./log.js");
var requestDispatcher = require("./RequestDispatcher.js").create();

/*
	request = { method, queryString, url, statusCode, headers}
*/

function Api() {
	this.resources = {};
	this.resourceNames = [];
}

Api.prototype = {

	filter: function(pipeline) {
		// filter out unwanted request
		log.debug('filter');
		if (pipeline.data.request.url == '/favicon.ico') {
			// 404;
			pipeline.result.status = 404;
			pipeline.result.response = "Not Fuund";
			pipeline.clear();
		}
	},

	processRequestBody: function(pipeline) {
		// for POST and PUT read the body stream
		log.debug('processRequestBody');

		var request = pipeline.data.request;
		var response = pipeline.data.response;

		if (request.method != 'POST' && request.method != 'PUT') {
			log.debug('no body expected... skipping.');
			return;
		}

		var body = '';
		request.on('data', function(data) {
			body += data;

			// Too much POST data, kill the connection!
			if (body.length > 1e6)
				req.connection.destroy();
		});
		request.on('end', function() {
			try {
				if (body !== '') {
					pipeline.data.postData = JSON.parse(body);
				}
				pipeline.next();
			} catch (ex) {
				log.debug('bad post data');
				pipeline.next('bad post data');
			}
		});

		return false;
	},

	writeResponse: function(pipeline) {
		// json response, status, response.end, etc
		log.debug('writeResponse: ' + pipeline.result.status);
		pipeline.data.response.setHeader('content-type', 'application/json');
		
		pipeline.data.response.writeHead(pipeline.result.status);
		pipeline.data.response.write(JSON.stringify(pipeline.result.response, null, 2));
		pipeline.data.response.end();
	},

	processQueryString: function(pipeline) {
		log.debug("api.processQueryString");
		var request = pipeline.data.request;
		var url = request.url;

		var urlParts = url.split('?');

		request.queryString = {};
		if (urlParts.length == 2) {
			var queries = urlParts[1].split('&');
			for(var i=0; i<queries.length; i++) {
				var queryParts = queries[i].split('=');
				var key = queryParts[0];
				var value = queryParts[1]?decodeURI(queryParts[1]):"true";

				if (!request.queryString[key]) {
					request.queryString[key] = value;
				} else if (!Array.isArray(request.queryString[key])) {
					var existing = request.queryString[key];
					request.queryString[key] = [];
					request.queryString[key][0] = existing;
					request.queryString[key][1] = value;
				} else {
					request.queryString[key][request.queryString[key].length] = value;
				}
			}
		}
	},

	processUrl: function(pipeline) {
		/*
			resource/(id)
			parent/id/child/(id) - order/12/items, order/12/items/42
		*/
		log.debug("api.processQueryUrl");
		
		var request = pipeline.data.request;
		var url = request.url;

		log.debug('url: ' + url);
		
		var urlParts = url.split('?');

		var pathSegments = urlParts[0].split('/');

		if (pathSegments[pathSegments.length-1].charAt(0) == "$"){
			pipeline.data.facet = pathSegments.pop().substring(1);
		}

		if (pathSegments.length <= 3) {
			pipeline.data.resource = pathSegments[1];
			pipeline.data.id = pathSegments[2];
		} else {
			pipeline.data.parentResource = pathSegments[1];
			pipeline.data.parentId = pathSegments[2];
			pipeline.data.resource = pathSegments[3];
			pipeline.data.id = pathSegments[4];
		}

		// if (pipeline.data.id.charAt(0) == "$") {
		// 	pipeline.data.facet = pipeline.data.id.substring(1);
		// 	pipeline.data.id = "";
		// }

		log.debug('parent:   ' + pipeline.data.parentResource);
		log.debug('parentId: ' + pipeline.data.parentId);
		log.debug('resource: ' + pipeline.data.resource);
		log.debug('id:       ' + pipeline.data.id);
		log.debug('facet:    ' + pipeline.data.facet)
	},

	routeRequest: function(pipeline) {
		log.debug("api.routeRequest");
		var request = pipeline.data.request;
		var result = pipeline.result;

		var modelResource = this.resources[pipeline.data.resource];
			

		if (!modelResource) {
			pipeline.result.status = 404;
			pipeline.result.response = "Resource Type Not Found";
			pipeline.clear();
			return;
		}

		if (pipeline.data.parentResource) {
			if (modelResource.parent != pipeline.data.parentResource) {
				pipeline.result.status = 404;
				pipeline.result.response = "Parent or Resource Type Not Found";
				pipeline.clear();
				return;
			}

			request.parentResource = pipeline.data.parentResource;
			request.parentId = pipeline.data.parentId;
		}

		if (modelResource.onBeforeRoute) {
			modelResource.onBeforeRoute(pipeline.data);
		}

		var method = request.method;

		log.log(method + ': ' + request.url);
		var restResult;

		try {
			var answer = requestDispatcher.dispatch(request, modelResource, pipeline.data);
			pipeline.result.status = answer.status;
		}
		catch(e) {
			pipeline.next(e.toString());
			return;
		}

		if (answer.response === false) {
			pipeline.clear();
			return;
		}

		if (typeof(answer.response) != 'undefined'){
			pipeline.result.response = answer.response;
		}
		
	},

	onRequest: function(request, response) {
		log.debug("api.onRequest");
		var me = this;
		var pipeline = new Pipeline();
		pipeline.data = {
			request: request,
			response: response,
		};
		pipeline.result = {
			status: 200
		};

		pipeline.data.request._api = this;

		pipeline.enqueue(this.filter.bind(this));
		pipeline.enqueue(this.processRequestBody.bind(this));
		pipeline.enqueue(this.processQueryString.bind(this));
		pipeline.enqueue(this.processUrl.bind(this));
		pipeline.enqueue(this.routeRequest.bind(this));

		pipeline.go(function(err, pipeline) {
			if (err) {
				log.debug("api.err: " + err);
				pipeline.clear();
				pipeline.result.status = 500;
				pipeline.result.response = { error: err };
			}

			// pipeline.enqueue(this.prepareResponsee.bind(this));
			pipeline.enqueue(me.writeResponse.bind(me));
			pipeline.go(function(err, pipeline) {
				log.debug("finished ");
			});
		});
	},

	start: function(port) {
		log.debug("listening on port " + port + "...");
		var me = this;
		var http = require("http");
		var server = http.createServer(me.onRequest.bind(me));
		server.listen(port);
	},

	addResource: function(resourceCfg, config) {
		if (config && config.applyBoilerPlate) {
			this.applyBoilerPlate(resourceCfg);
		}

		this.resources[resourceCfg.url] = resourceCfg;
		this.resourceNames[this.resourceNames.length] = resourceCfg.url;
	},

	applyBoilerPlate: function(other) {
		var me = this;
		var functions = {
			onList: function(request) {
				if (request.parentId) {
					return this.model.queryItems(function(item) { 
						return other.parentFilter(item, request.parentId); 
					});
				}
				return this.model.list();
			},

			onGet: function(id, request) {
				return this.model.get(id);
			},

			onPost: function(data) {
				return this.model.create(data);
			},

			onPut: function(id, data) {
				try {
					log.debug('PUT: ' + JSON.stringify(data, null, 2));
					return this.model.update(id, data);
				}
				catch(e) {
					return null;
				}
			}
		};

		for(var fn in functions) {
			other['base_' + fn] = functions[fn];
			if (!other[fn]) {
				other[fn] = functions[fn];
			}
		}
	
	}
};

module.exports = Api;