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

test('sequence read (in different queues)', function * (t) {
	yield jobs.remove();

	yield queueOne.put({test: '1'});
	yield queueOne.put({test: '2'});
	yield queueOne.put({test: '3'});

	var takeOne = yield queueOne.take(2);
	var takeTwo = yield queueTwo.take(2);

	var i = 0;

	for (let job of takeOne) { i++; }
	for (let job of takeTwo) { i++; }

	t.equal(i, 3, 'should not retake jobs');
});

test('sequence read (in same queue)', function * (t) {
	yield jobs.remove();

	yield queueOne.put({test: '1'});
	yield queueOne.put({test: '2'});
	yield queueOne.put({test: '3'});

	var takeOne = yield queueOne.take(2);
	var takeTwo = yield queueOne.take(2);

	var i = 0;

	for (let job of takeOne) { i++; }
	for (let job of takeTwo) { i++; }

	t.equal(i, 3, 'should not retake jobs');
});

test('teardown', function * () {
	queueOne.close();
	queueTwo.close();
	db.close();
});
