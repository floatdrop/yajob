import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('removes job', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'wow'});
		await queue.remove({test: 'wow'});
		const jobs = await queueDb.db.collection('default').find().toArray();
		t.is(jobs.length, 0, 'should remove job from queue');
	} finally {
		await queueDb.close();
	}
});
