var sapi = require('../apiExercises.js');

describe('apiExercise list_rotate', function() {
    var api;

    beforeEach(function() {
        api = sapi.exercisesApi;
        api.model = {
            
        }
    });

    afterEach(function() {
        api.model = undefined;
    });

    it ('shouldn\' fail', function() {
        expect(api).not.toBe(undefined);
        api.list_rotate();
    });
});
