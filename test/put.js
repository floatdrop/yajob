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
	t.equal(job[0].attrs.test, 'message', 'should contain saved attrs');
});

test('put take an Array as argument', function * (t) {
	yield jobs.remove();

	yield queue.put([{test: '1'}]);
	var job = yield jobs.find();
	t.equal(job.length, 1, 'should be one document in default collection');
	t.equal(job[0].attrs.test, '1', 'should contain saved attrs');
	yield queue.put([{test: '2'}, {test: '3'}]);

	job = yield jobs.find();
	t.equal(job.length, 3, 'should be one document in default collection');
	t.equal(job[1].attrs.test, '2', 'should contain saved attrs');
	t.equal(job[2].attrs.test, '3', 'should contain saved attrs');
});

test('teardown', function * () {
	queue.close();
	db.close();
});
