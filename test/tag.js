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

    var step = yield queue.take();
    t.deepEqual(step.next().value, {test: 'wow'}, 'should return right job');
    t.ok(step.next().done, 'should return one jobs');
});


test('teardown', function * () {
    queue.close();
    db.close();
});
