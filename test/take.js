import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('take one', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});

		const promise = queue.take();
		t.is(typeof promise.then, 'function', 'should return a Promise');

		const taken = Array.from(await promise);
		t.same(taken, [{test: 'wow'}]);

		const jobs = await queueDb.db.collection('default').find().toArray();
		t.is(jobs.length, 0, 'should remove job from queue');
	} finally {
		await queue.close();
		await queueDb.close();
	}
});

test('take two', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow1'});
		await queue.put({test: 'wow2'});

		const taken = Array.from(await queue.take(2));
		t.same(taken[0], {test: 'wow1'});
		t.same(taken[1], {test: 'wow2'});
	} finally {
		await queue.close();
		await queueDb.close();
	}
});

test('take some', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});

		const taken = Array.from(await queue.take(2));
		t.same(taken[0], {test: 'wow'});
	} finally {
		await queue.close();
		await queueDb.close();
	}
});

test('take limit', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});
		await queue.put({test: 'wow'});

		const taken = Array.from(await queue.take(2));
		t.same(taken[0], {test: 'wow'});
	} finally {
		await queue.close();
		await queueDb.close();
	}
});
