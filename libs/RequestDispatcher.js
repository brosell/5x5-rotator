
function RequestDispatcher() {

    this.dispatch = function(request, modelResource, data) {
        var result = { status: 404, response: "Not found" };
        var restResult = "";

        var methodName = "";
        var args = [];
        var successStatus = 200;

        switch(request.method) {
            case 'GET':
                if (data.id) {
                    methodName = data.facet ? 'get_' + data.facet : 'onGet';
                    args = [data.id];        
                }
                else {
                    methodName = data.facet ? 'list_' + data.facet : 'onList';
                }
                break;
            case 'POST':
                methodName = data.facet ? 'post_'+data.facet : 'onPost';
                args = [data.postData];
                successStatus = 201;
                break;
            case 'PUT':
                methodName = data.facet ? 'put_'+data.facet : 'onPut';
                args = [data.id, data.postData];
                break;
            case 'DELETE':
                methodName = data.facet ? 'delete_' + data.facet : 'onDelete';
                args = [data.id];
                break;
            default:
                break;
        }

        if (modelResource[methodName]){
            args.push(request);
            restResult = modelResource[methodName].apply(modelResource, args);
            if(restResult)
                result.status = successStatus;
        
            result.response = restResult;
        }
        else {
            result.status = 404;
            result.response = 'Not found';
        }
        
        return result;
    };
}

module.exports = {
    create: function() {
        return new RequestDispatcher();
    }
};
