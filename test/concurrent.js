import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('concurrent read', async t => {
	const queueDb = await new QueueDb();
	const queueOne = yajob(queueDb.uri);
	const queueTwo = yajob(queueDb.uri);

	try {
		for (let n = 0; n < 100; n++) {
			await queueOne.put({n});
		}

		const takes = await Promise.all([queueOne.take(50), queueTwo.take(50)]);
		const takesLength = Array.from(takes[0]).length + Array.from(takes[1]).length;

		t.ok(takesLength > 50, 'should put jobs in both queues');
	} finally {
		await queueDb.close();
	}
});
