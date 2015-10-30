import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('skip', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});

		const step = await queue.take();
		t.same(step.next().value, {test: 'wow'}, 'should return right job');
		t.ok(step.next(false).done, 'should return one jobs');

		const job = await queueDb.db.collection('default').find().toArray();
		t.is(job.length, 1, 'should return job in queue');
	} finally {
		await queue.close();
		await queueDb.close();
	}
});
