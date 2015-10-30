import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('asc priority', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		queue.sort({priority: -1});

		await queue.put({test: '1'}, {priority: 1});
		await queue.put({test: '2'}, {priority: 2});

		const steps = Array.from(await queue.take(2));

		t.same(steps[0], {test: '2'});
		t.same(steps[1], {test: '1'});
	} finally {
		await queue.close();
		await queueDb.close();
	}
});

test('desc priority', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		queue.sort({priority: 1});

		await queue.put({test: '1'}, {priority: 1});
		await queue.put({test: '2'}, {priority: 2});

		const steps = Array.from(await queue.take(2));
		t.same(steps[0], {test: '1'});
		t.same(steps[1], {test: '2'});
	} finally {
		await queue.close();
		await queueDb.close();
	}
});
