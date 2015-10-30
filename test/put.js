import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('put should add job to queue', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put({test: 'message'});
		const job = await queueDb.db.collection('default').find().toArray();
		t.same(job[0].attrs, {test: 'message'});
	} finally {
		await queue.close();
		await queueDb.close();
	}
});

test('put take an Array as argument', async t => {
	const queueDb = await QueueDb();
	const queue = yajob(queueDb.uri);

	try {
		await queue.put([{test: '1'}]);
		let job = await queueDb.db.collection('default').find().toArray();
		t.same(job[0].attrs, {test: '1'});

		await queue.put([{test: '2'}, {test: '3'}]);
		job = await queueDb.db.collection('default').find().toArray();
		t.same(job[0].attrs, {test: '1'});
		t.same(job[1].attrs, {test: '2'});
		t.same(job[2].attrs, {test: '3'});
	} finally {
		await queue.close();
		await queueDb.close();
	}
});
