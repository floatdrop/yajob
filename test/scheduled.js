import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('scheduled', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'}, {schedule: new Date(Date.now() + 24 * 60 * 60 * 1000)});

		let jobs = Array.from(await queue.take());
		t.same(jobs.length, 0, 'should return scheduled jobs');

		await queue.put({test: 'wow'}, {schedule: new Date(Date.now() - 1000)});

		jobs = Array.from(await queue.take());
		t.same(jobs.length, 1, 'should return scheduled job');
	} finally {
		await queueDb.close();
	}
});
