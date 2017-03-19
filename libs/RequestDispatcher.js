
function RequestDispatcher() {

    this.dispatch = function(request, modelResource, data) {
        var method = request.method;
        var result = { status: 404, response: "Not found" };
        var restResult = "";
        // return value { status: nnn, response: ffff }
        if (method == 'GET' && !data.id && data.facet) {
            restResult = modelResource['list_' + data.facet](request);
            if (restResult) {
                result.status = 200;
            }
        } else if (method == 'GET' && !data.id && modelResource.onList) {
            // list
            restResult = modelResource.onList(request);
            if (restResult) {
                result.status = 200;
            }
        } 
        
        else if (method == 'GET' && data.facet) {
            // get
            restResult = modelResource['get_' + data.facet](data.id, request);
            if (restResult) {
                result.status = 200;
            }
        } else if (method == 'GET' && modelResource.onGet) {
            // get
            restResult = modelResource.onGet(data.id, request);
            if (restResult) {
                result.status = 200;
            }
        } 
        
        else if (method == 'POST' && !data.id && data.facet) {
            // create
            restResult = modelResource['post_' + data.facet](data.postData, request);
            if (restResult) {
                result.status = 201;
            }
        } else if (method == 'POST' && !data.id && modelResource.onPost) {
            // create
            restResult = modelResource.onPost(data.postData, request);
            if (restResult) {
                result.status = 201;
            }
        } 
        
        else if (method == 'PUT' && data.facet) {
            restResult = modelResource['put_' + data.facet](data.id, data.postData, request);
            if (restResult) {
                result.status = 200;
            }
        } else if (method == 'PUT' && modelResource.onPut) {
            restResult = modelResource.onPut(data.id, data.postData, request);
            if (restResult) {
                result.status = 200;
            }
        } 
        
        else if (method == 'DELETE' && data.facet) {
            restResult = modelResource['delete_'+ data.facet](data.id, request);
            if (restResult) {
                result.status = 200;
            }
        } else if (method == 'DELETE' && modelResource.onDelete) {
            restResult = modelResource.onDelete(data.id, request);
            if (restResult) {
                result.status = 200;
            }
        }

        result.response = restResult;

        return result;
    };
}

module.exports = {
    create: function() {
        return new RequestDispatcher();
    }
};
