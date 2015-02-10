var test = require('gap');

var queue = require('../')('localhost/test')
    .tag('mails');

var monk = require('monk');
var db = monk('localhost/test');
var jobs = db.get('mails');

test('setup', function * () {
    try {
        yield jobs.drop();
    } catch (e) { }
});

test('tag', function * (t) {
    yield queue.put({test: 'wow'});
    var job = yield jobs.find();
    t.equal(job.length, 1, `should return job in mail queue`);
});


test('teardown', function * () {
    queue.close();
    db.close();
});
