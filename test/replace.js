import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('replace should add job to queue then update it', async t => {
	const queueDb = await new QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'message'}, {meta: {param: 1}});
		const job = await queueDb.db.collection('default').find().toArray();
		t.same(job[0].attrs, {test: 'message'});
		t.same(job[0].meta, {param: 1});
		await queue.replace({test: 'message'}, {meta: {param: 2}});
		const job2 = await queueDb.db.collection('default').find().toArray();
		t.same(job2[0].attrs, {test: 'message'});
		t.same(job2[0].meta, {param: 2});
	} finally {
		await queueDb.close();
	}
});

