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

test('priority', function * (t) {
    queue.sort({priority: -1});
    yield queue.put({test: '1'}, {priority: 1});
    yield queue.put({test: '2'}, {priority: 2});

    var it = yield queue.take(2);
    var step = it();
    t.deepEqual(step.next().value, {test: '2'}, 'should return right job');
    t.deepEqual(step.next().value, {test: '1'}, 'should return right job');
    t.ok(step.next().done);
});

test('priority', function * (t) {
    queue.sort({priority: 1});
    yield queue.put({test: '1'}, {priority: 1});
    yield queue.put({test: '2'}, {priority: 2});

    var it = yield queue.take(2);
    var step = it();
    t.deepEqual(step.next().value, {test: '1'}, 'should return right job');
    t.deepEqual(step.next().value, {test: '2'}, 'should return right job');
    t.ok(step.next().done);
});


test('teardown', function * () {
    queue.close();
    db.close();
});
