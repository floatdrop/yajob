import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('trys', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri).trys(2).delay(2000);

	try {
		await yajob(queueDb.uri).put({test: 'wow'});

		let step = await queue.take();
		t.same(step.next().value, {test: 'wow'}, 'should return right job');
		t.ok(step.next(false).done, 'should return one jobs');

		await new Promise(resolve => setTimeout(resolve, 1000));

		step = await queue.take();
		t.ok(step.next().done, 'should not take sheduled job');

		await new Promise(resolve => setTimeout(resolve, 1000));

		step = await queue.take();
		t.same(step.next().value, {test: 'wow'}, 'should not changed job between trys');
		t.ok(step.next().done, 'should return one jobs');

		await new Promise(resolve => setTimeout(resolve, 1000));

		const count = await queueDb.db.collection('default').count();
		t.is(count, 0, 'should process job after retry');
	} finally {
		await queueDb.close();
	}
});
