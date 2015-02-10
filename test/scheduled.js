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

test('skip', function * (t) {
    yield queue.put({test: 'wow'}, {schedule: new Date(Date.now() + 1000)});

    var it = yield queue.take();
    var step = it();
    t.ok(step.next(false).done, 'should return no jobs');
});


test('teardown', function * () {
    queue.close();
    db.close();
});
