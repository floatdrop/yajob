var test = require('gap');

var queue = require('../')('localhost/test');

var monk = require('monk');
var db = monk('localhost/test');
var jobs = db.get('default');

test('setup', function * () {
    try {
        yield jobs.drop();
    } catch (e) { }
});

test('return an iterator', function * (t) {
    var it = queue.take();
    t.ok(typeof it.next === 'function', 'should have next method');
});

test('teardown', function * () {
    queue.close();
    db.close();
});
