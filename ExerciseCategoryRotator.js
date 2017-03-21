var LINQ = require('node-linq').LINQ;

function ExerciseCategoryRotator() {
    
    this.rotate = function(category) {
        var count = category.length;
        for (var i=0; i<count; i++) {
            if (category[i].isCurrent) {
                category[i].isCurrent = false;
                if (i != count-1){
                    category[i+1].isCurrent = true;
                }
                else {
                    category[0].isCurrent = true;
                }
                return;
            }
        }
    };

    this.rotateAll = function(exercises) {
        var categories = new LINQ(exercises).GroupBy(function(it) { return it.category; });
        var result = [];
        for (var t in categories){
            this.rotate(categories[t]);
            categories[t].forEach(function(it) { result.push(it); });
        }
        return result;
    };
}

module.exports = {
    create: function() {
        return new ExerciseCategoryRotator();
    }
}