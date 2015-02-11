'use strict';

var test = require('gap');

var monk = require('monk');
var db = monk('localhost/test');
var jobs = db.get('default');
var queueOne, queueTwo;

test('setup', function * () {
    queueOne = require('../')('localhost/test');
    queueTwo = require('../')('localhost/test');

    try {
        yield jobs.drop();
    } catch (e) { }
});

test('concurrent', function * (t) {

    yield queueOne.put({test: '1'});
    yield queueOne.put({test: '2'});
    yield queueOne.put({test: '3'});

    var takes = yield [queueOne.take(2), queueTwo.take(2)];
    var i = 0;

    for (let job of takes[0]) { i++; }
    for (let job of takes[1]) { i++; }

    t.equal(i, 2, 'should not retake jobs');
});

test('teardown', function * () {
    queueOne.close();
    queueTwo.close();
    db.close();
});
