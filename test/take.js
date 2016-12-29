import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

async function wait(time) {
	return new Promise(resolve => setTimeout(resolve, time));
}

test('take one', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});

		const promise = queue.take();
		t.is(typeof promise.then, 'function', 'should return a Promise');

		const taken = Array.from(await promise);
		t.same(taken, [{test: 'wow'}]);

		const jobs = Array.from(queue.take());
		t.is(jobs.length, 0, 'should remove job from queue');
	} finally {
		await queueDb.close();
	}
});

test('take two', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow1'});
		await queue.put({test: 'wow2'});

		const taken = Array.from(await queue.take(2));
		t.same(taken[0], {test: 'wow1'});
		t.same(taken[1], {test: 'wow2'});
	} finally {
		await queueDb.close();
	}
});

test('take some', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});

		const taken = Array.from(await queue.take(2));
		t.same(taken[0], {test: 'wow'});
	} finally {
		await queueDb.close();
	}
});

test('take limit', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});
		await queue.put({test: 'wow'});

		const taken = Array.from(await queue.take(2));
		t.same(taken[0], {test: 'wow'});
	} finally {
		await queueDb.close();
	}
});

test('take with `historyInterval` should not delete job after itself', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});

		const job = await queue.historyInterval(100).take();
		job.next();
		job.next();

		await wait(1000);

		const jobs = await queueDb.db.collection('default').find().toArray();
		t.same(jobs.length, 1);
	} finally {
		await queueDb.close();
	}
});

test('take with zero `historyInterval` should clean all `taken` jobs', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});

		const job = await queue.historyInterval(0).take();
		job.next();
		job.next();

		await wait(1000);

		const jobs = await queueDb.db.collection('default').find().toArray();
		t.same(jobs.length, 0);
	} finally {
		await queueDb.close();
	}
});

test('take should clean only old `taken` jobs', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow1'});
		await queue.take();
		await queue.put({test: 'wow2'});
		await wait(200);
		await queue.historyInterval(100).take();

		const jobs = await queueDb.db.collection('default').find().toArray();
		t.same(jobs.length, 1);
	} finally {
		await queueDb.close();
	}
});
