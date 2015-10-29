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

test('concurrent read', function * (t) {
	yield jobs.remove();

	for (var n = 0; n < 100; n++) {
		yield queueOne.put({test: n});
	}

	var takes = yield [queueOne.take(50), queueOne.take(50)];

	var i = 0;

	for (let job of takes[0]) { i++; }
	for (let job of takes[1]) { i++; }

	t.ok(i > 50, 'should put jobs in both queues');
});

test('teardown', function * () {
	queueOne.close();
	queueTwo.close();
	db.close();
});
