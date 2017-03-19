var log = require("./libs/log.js");
var Model = require("./libs/Model.js");

module.exports = {
	exercises: new Model({
		name: 'exercises',
		fields: [
			'category',
			'exerciseName',
			'description',
			'isCurrent'
		],
		validators: {
			'category': function(value, current) {
				return ['pull', 'push', 'hinge', 'leg', 'core'].indexOf(value) != -1;
			}
		},
		parentField: 'category'
	})
};


