var log = require("./libs/log.js");
var models = require('./models.js');

function ExerciseBootstrapper(exercises) {
    
    var exercisesData = {
            "pull": [ "pull-up", "chin-up", "Austrailian pull-up", "row" ],
            "push": [ "push-up", "inclined push-up", "dip" ],
            "hinge": [ "dead-lift", "kettlebell-swing"],
            "core": [ "plank", "mountain-climber"],
            "leg": [ "squat", "lunge", "Russian lunge", "pistol-squat"]
    };
    
    this.bootstrap = function() {
        exercises.clear();

        for (var cat in exercisesData){
            for (var i=0; i<exercisesData[cat].length; i++){
                exercises.create( { category: cat, exerciseName: exercisesData[cat][i], isCurrent: (i==0) });
            }
        }
    }
}

module.exports = {
    
	exercisesApi: {
		name: 'exercises',
		url: 'exercises',
        
        parent: 'categories',
        parentFilter: function(item, parentId) { return item.category == parentId; },

        // FACETS
        list_rotate: function() {
            return { result: "rotated" };
        },
        get_rotate: function(id) {
            return { result: "rotated: " + id };
        },
        list_currentExercises: function(request) {
            return this.model.queryItems(function(item) { return request.parentId?(item.isCurrent && item.category==request.parentId):item.isCurrent; });
        },
        list_bootstrap: function() {
            var bootstrapper = new ExerciseBootstrapper(this.model);
            bootstrapper.bootstrap();
            return this.model.list()
        },
        // end FACETS

	},

	init: function(api, models) {
		this.exercisesApi.model = models.exercises;
		api.addResource(this.exercisesApi, { applyBoilerPlate: true });
		
		return {  exercisesApi: this.exercisesApi };
	}
}

