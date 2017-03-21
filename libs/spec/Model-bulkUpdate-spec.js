var Model = require("../Model.js");

var exercises = new Model({
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
});

describe('Model bulkUpdate', function() {
    var model;
    
    beforeEach(function() {
        model = new Model({
            name: 'exercises',
            fields: [
                'field1',
                'field2'
            ]
        });
    });

    it('updates one item', function() {
        spyOn(model, 'update');

        var item = {
            id: 1,
            field1: 42,
            field2: 45
        };
        
        model.bulkUpdate([item]);

        expect(model.update).toHaveBeenCalledTimes(1);
        expect(model.update).toHaveBeenCalledWith(1, item);
    });

    it('throws when items have no id', function() {
        var item = {
            field1: 42,
            field2: 45
        };
        
        expect(function() { model.bulkUpdate([item]); }).toThrow();
    });

    it('updates many items', function() {
        spyOn(model, 'update');

        var items = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
        ];

        model.bulkUpdate(items);

        expect(model.update).toHaveBeenCalledTimes(4);
        // expect(model.update).toHaveBeenCalledWith(1, items[0]);
        // expect(model.update).toHaveBeenCalledWith(2, items[1]);
        // expect(model.update).toHaveBeenCalledWith(3, items[2]);
        // expect(model.update).toHaveBeenCalledWith(4, items[3]);
    });

    
});