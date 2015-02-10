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

test('remove', function * (t) {
    yield queue.put({test: 'wow'});
    yield queue.remove({test: 'wow'});
    var job = yield jobs.find();
    t.equal(job.length, 0, 'should remove job from queue');
});

test('teardown', function * () {
    queue.close();
    db.close();
});
