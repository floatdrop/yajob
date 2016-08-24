import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('putUnique should add only unique jobs to queue', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.putUnique({a: 'b', c: {d: 'e'}});
		await queue.putUnique({test: 'message2'});
		const nInserted = await queue.putUnique({a: 'b', c: {d: 'e'}});
		const job = await queueDb.db.collection('default').find().toArray();

		t.same(nInserted, {result: {ok: 0, n: 0}});
		t.same(job.length, 2);
	} finally {
		await queueDb.close();
	}
});
