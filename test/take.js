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

    var job = yield jobs.find();
    t.equal(job.length, 0, 'should remove job from queue');
});

test('take two', function * (t) {
    yield queue.put({test: 'wow1'});
    yield queue.put({test: 'wow2'});

    var it = yield queue.take(2);
    var step = it();
    t.deepEqual(step.next().value, {test: 'wow1'}, 'should return right job');
    t.deepEqual(step.next().value, {test: 'wow2'}, 'should return right job');
    t.ok(step.next().done, 'should return two jobs');
});

test('take some', function * (t) {
    yield queue.put({test: 'wow'});

    var it = yield queue.take(2);
    var step = it();
    t.deepEqual(step.next().value, {test: 'wow'}, 'should return right job');
    t.ok(step.next().done, 'should return one jobs');
});

test('take limit', function * (t) {
    yield queue.put({test: 'wow'});
    yield queue.put({test: 'wow'});

    var it = yield queue.take(1);
    var step = it();
    t.deepEqual(step.next().value, {test: 'wow'}, 'should return right job');
    t.ok(step.next().done, 'should return one jobs');
});

test('teardown', function * () {
    queue.close();
    db.close();
});
