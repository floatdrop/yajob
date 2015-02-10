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

test('take one', function * (t) {
    yield queue.put({test: 'wow'});

    var promise = queue.take();
    t.equal(typeof promise.then, 'function', 'should return a Promise');

    var it = yield promise;
    t.equal(typeof it, 'function', 'Promise should be resolved to a function');

    var step = it();
    t.deepEqual(step.next().value, {test: 'wow'}, 'should return right job');
    t.ok(step.next().done, 'should return one job');
});

test('teardown', function * () {
    queue.close();
    db.close();
});
