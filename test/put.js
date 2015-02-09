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

test('put should add job to queue', function * (t) {
    yield queue.put({
        test: 'message'
    });

    var job = yield jobs.find();

    t.equal(job.length, 1, 'should be one document in default collection');
});

test('teardown', function * () {
    queue.close();
    db.close();
});
