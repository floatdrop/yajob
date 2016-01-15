import test from 'ava';
import yajob from '..';
import {QueueDb} from './_utils';

test('sequence read (in different queues)', async t => {
	const queueDb = await new QueueDb();
	const queueOne = yajob(queueDb.uri);
	const queueTwo = yajob(queueDb.uri);

	try {
		await queueOne.put({test: '1'});
		await queueOne.put({test: '2'});
		await queueOne.put({test: '3'});

		const takeOne = await queueOne.take(2);
		const takeTwo = await queueTwo.take(2);

		const jobsTaken = Array.from(takeOne).length + Array.from(takeTwo).length;
		t.is(jobsTaken, 3, 'should not retake jobs');
	} finally {
		await queueDb.close();
	}
});

test('sequence read (in same queue)', async t => {
	const queueDb = await new QueueDb();
	const queueOne = yajob(queueDb.uri);

	try {
		await queueOne.put({test: '1'});
		await queueOne.put({test: '2'});
		await queueOne.put({test: '3'});

		const takeOne = await queueOne.take(2);
		const takeTwo = await queueOne.take(2);

		const jobsTaken = Array.from(takeOne).length + Array.from(takeTwo).length;
		t.is(jobsTaken, 3, 'should not retake jobs');
	} finally {
		await queueDb.close();
	}
});
