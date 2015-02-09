var test = require('gap');

var queue = require('./')('localhost/queue');

var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost/queue');

test('put should add job to queue', function * (t) {
    yield queue.put({
        test: 'message'
    });

    var jobs = wrap(db.get('default'));
    var job = yield jobs.find();

    t.equal(job.length, 1, 'should be one document in default collection');
});
