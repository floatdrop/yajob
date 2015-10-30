import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('scheduled', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'}, {schedule: new Date(Date.now() + 2000)});

		let jobs = Array.from(await queue.take());
		t.same(jobs.length, 0, 'should return no jobs');

		await new Promise(resolve => { setTimeout(resolve, 3000); });

		jobs = Array.from(await queue.take());
		t.same(jobs.length, 1, 'should return job');
	} finally {
		await queue.close();
		await queueDb.close();
	}
});
