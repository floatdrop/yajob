import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('trys', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri).trys(1);

	try {
		await queue.put({test: 'wow'});

		const step = await queue.take();
		t.same(step.next().value, {test: 'wow'}, 'should return right job');
		t.ok(step.next(false).done, 'should return one jobs');

		await new Promise(resolve => setTimeout(resolve, 1000));

		const jobs = await queueDb.db.collection('default').find({status: queue.status.failed}).toArray();
		t.is(jobs.length, 1, 'should return failed job in queue');
	} finally {
		await queueDb.close();
	}
});
