var LINQ = require('node-linq').LINQ;
var ExerciseCategoryRotator = require('../ExerciseCategoryRotator.js')

describe('Exercise Category Rotator', function() {
    var me = this;
    var cat = [];
    var rotator = {};

    beforeEach(function() {
        rotator = ExerciseCategoryRotator.create();
    });

    var cases = [ // zero based indexes!
        { count: 2, current: 0, nextCurrent: 1 },
        { count: 5, current: 0, nextCurrent: 1 },
        { count: 5, current: 3, nextCurrent: 4 },
        { count: 5, current: 2, nextCurrent: 3 },
        { count: 4, current: 3, nextCurrent: 0 },
        { count: 1, current: 0, nextCurrent: 0 },
        
    ];

    all('makes the correct one isCurrent', cases, function(tc) {
        var cat = []
        for (var i=0; i<tc.count; i++) {
            cat.push({name: i, isCurrent: i==tc.current});
        }

        rotator.rotate(cat);

        expect(cat[tc.nextCurrent].isCurrent).toBeTruthy();
        expect(new LINQ(cat).Where(function(it) { return it.isCurrent; }).Count()).toBe(1);
    });

    it('rotates all categories from list', function() {
        items = [
            { category: 'push', name: '1', isCurrent: true },
            { category: 'push', name: '2', isCurrent: false },
            { category: 'push', name: '3', isCurrent: false },
            { category: 'pull', name: '1', isCurrent: false },
            { category: 'pull', name: '2', isCurrent: true },
            { category: 'pull', name: '3', isCurrent: false },
            { category: 'r', name: '1', isCurrent: false },
            { category: 'r', name: '2', isCurrent: false },
            { category: 'r', name: '3', isCurrent: false },
            { category: 'r', name: '4', isCurrent: true },
        ];

        items = rotator.rotateAll(items);

        var areCurrent = new LINQ(items).Where(function(it) { return it.isCurrent; });
        expect(areCurrent.Count()).toBe(3);
        expect(areCurrent.Any(function(it) { return it.category == 'push' && it.name == '2' })).toBeTruthy();
        expect(areCurrent.Any(function(it) { return it.category == 'pull' && it.name == '3' })).toBeTruthy();
        expect(areCurrent.Any(function(it) { return it.category == 'r' && it.name == '1' })).toBeTruthy();
    });
    
});