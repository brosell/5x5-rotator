var RequestDispatcher = require("../RequestDispatcher.js");

function all(tag, cases, fn) {
        for(var i=0; i<cases.length; i++) {
            var tc = cases[i];
            (function(tc) {
                it(tag + ': ' + tc.tag, function() { fn(tc); } );
            })(tc);
        }    
    }


// get, no id, with facet
// get, no id, no facet
// get, id, with facet
// get, id, no facet

// put, id, with facet
// put, id, no facet

// post, no id, with facet
// post, no id, no facet

// delete, id, with facet
// delete, id, no facet


describe('RequestDispatcher', function() {
    var dispatcher;
    var apiResource = {}
    var data = {};
    var request = {}; 

    beforeEach(function() {
        dispatcher = RequestDispatcher.create();
    });

    afterEach(function() {

    });

    it('is awis instantiatalbe esome', function() {
        expect(dispatcher).not.toBe(undefined);
    });

    // get, no id, with facet
// get, no id, no facet
// get, id, with facet
// get, id, no facet

// put, id, with facet
// put, id, no facet

// post, no id, with facet
// post, no id, no facet

// delete, id, with facet
// delete, id, no facet
    
    var tcRespondsTo = [
        { tag: 'get/id', method: 'GET', id: 12, facet: undefined, expected: { fn: 'onGet', fnArgs: [12, request], status: 200, response: 'roger onGet' } },
        { tag: 'get/id/facet', method: 'GET', id: 12, facet: 'banana', expected: { fn: 'get_banana', fnArgs: [12, request], status: 200, response: 'roger get_banana' } },
        { tag: 'get/noid', method: 'GET', id: undefined, facet: undefined, expected: { fn: 'onList', fnArgs: [request], status: 200, response: 'roger onList' } },
        { tag: 'get/noid/facet', method: 'GET', id: undefined, facet: 'banana', expected: { fn: 'list_banana', fnArgs: [request], status: 200, response: 'roger list_banana' } },
        { tag: 'put/id', method: 'PUT', id: 12, postData: 'postData', facet: undefined, expected: { fn: 'onPut', fnArgs: [12, 'postData', request], status: 200, response: 'roger onGet', post: 'postData' } },
        { tag: 'put/id/facet', method: 'PUT', id: 13, postData: 'postData', facet: 'banana', expected: { fn: 'put_banana', fnArgs: [13, 'postData', request], status: 200, response: 'roger get_banana' } },
        { tag: 'post/noid', method: 'POST', postData: 'postData', facet: undefined, expected: { fn: 'onPost', fnArgs: ['postData', request], status: 201, response: 'roger onGet', post: 'postData' } },
        { tag: 'post/noid/facet', method: 'POST', postData: 'postData', facet: 'banana', expected: { fn: 'post_banana', fnArgs: ['postData', request], status: 201, response: 'roger get_banana' } },
        { tag: 'delete/id', method: 'DELETE', id: 12, facet: undefined, expected: { fn: 'onDelete', fnArgs: [12, request], status: 200, response: 'roger onGet', post: 'postData' } },
        { tag: 'delete/id/facet', method: 'DELETE', id: 13, facet: 'banana', expected: { fn: 'delete_banana', fnArgs: [13, request], status: 200, response: 'roger get_banana' } },
    ]
   
    all('responds to methods', tcRespondsTo, function(tc) {
        request.method = tc.method;
        data.id = tc.id;
        data.facet = tc.facet;
        data.postData = tc.postData;

        var calledArgs = [];
        apiResource[tc.expected.fn] = function() {
            for(var i=0; i<arguments.length; i++) {
                calledArgs.push(arguments[i]);
            }
            return tc.expected.response;
        };
        spyOn(apiResource, tc.expected.fn).and.callThrough(); 

        var result = dispatcher.dispatch(request, apiResource, data);

        expect({status: tc.expected.status, response: tc.expected.response}).toEqual(result);
        expect(apiResource[tc.expected.fn]).toHaveBeenCalledTimes(1);
        expect(calledArgs).toEqual(tc.expected.fnArgs);
    });


    
    it('pin dispatch', function() {
        
        request.method = "GET";

        apiResource.list_facet = function(request) { return "banana"; };
        
        data = {
            id: undefined,
            facet: "facet"
        };

        spyOn(apiResource, 'list_facet').and.returnValue("banana");
        
        var result = dispatcher.dispatch(request, apiResource, data);

        expect(result.status).toBe(200);
        expect(apiResource.list_facet).toHaveBeenCalledWith(request);
        expect(result.response).toBe("banana");
    });


});

