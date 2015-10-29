'use strict';

var test = require('gap');
var getIterable = require('get-iterable');

var monk = require('monk');
var db = monk('localhost/test');
var jobs = db.get('default');
var queueOne;
var queueTwo;

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

	var i = getIterable(takes[0]).length + getIterable(takes[1]).length;

	t.ok(i > 50, 'should put jobs in both queues');
});

test('teardown', function * () {
	queueOne.close();
	queueTwo.close();
	db.close();
});
