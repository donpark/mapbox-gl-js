'use strict';

var test = require('tape');

require('../../bootstrap');

var PaintProperties = require('../../../js/style/paint_properties');

test('PaintProperties', function(t) {
    test('resolves default values', function(t) {
        var f = new PaintProperties.fill();
        t.equal(f["fill-opacity"], 1);
        t.end();
    });

    test('parses default colors', function(t) {
        var f = new PaintProperties.fill();
        t.deepEqual(f["fill-color"], [0, 0, 0, 1]);
        t.end();
    });

    t.end();
});
