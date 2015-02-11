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

test('scheduled', function * (t) {
    yield queue.put({test: 'wow'}, {schedule: new Date(Date.now() + 50)});

    var step = yield queue.take();
    t.ok(step.next(false).done, 'should return no jobs');

    yield new Promise(function (resolve) {
        setTimeout(resolve, 100);
    });

    step = yield queue.take();
    t.ok(step.next(false).value, 'should return job');
});


test('teardown', function * () {
    queue.close();
    db.close();
});
