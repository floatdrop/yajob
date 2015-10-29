'use strict';

var queue = require('../')('localhost/queue');
var db = require('monk')('localhost/queue');
var co = require('co');

co(function * () {
	var collection = db.get('default');

	console.log('Removing jobs from collection...');
	yield collection.remove();

	let jobs = 1e4;
	{
		console.log(`Inserting ${jobs} jobs...`);
		let attrs = [];
		for (let i = 0; i < jobs; i++) {
			attrs.push({});
		}
		let start = process.hrtime();
		yield queue.put(attrs);
		let end = process.hrtime(start);
		let ms = (end[0] * 1e9 + end[1])/1e6;
		let perjob = ms/jobs;
		console.log(`Done:`);
		console.log(`	   ${perjob}ms per job`);
	}

	{
		let batch = 100;
		console.log(`Taking ${jobs} jobs by ${batch} job batch...`);
		let start = process.hrtime();
		for (let i = 0; i < jobs / batch; i++) {
			for (let job of yield queue.take(batch)) {}
		}
		let end = process.hrtime(start);
		let ms = (end[0] * 1e9 + end[1])/1e6;
		let perjob = ms/jobs;
		console.log(`Done:`);
		console.log(`	   ${perjob}ms per job`);
	}

	db.close();
	queue.close();
}).catch(function (err) {
	console.log(err.stack);
});
