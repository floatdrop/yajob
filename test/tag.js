import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('tag', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri).tag('mails');

	try {
		await queue.put({test: 'wow'});

		const jobs = Array.from(await queue.take());
		t.same(jobs, [{test: 'wow'}]);
	} finally {
		await queue.close();
		await queueDb.close();
	}
});
