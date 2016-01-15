'use strict';

const MongoClient = require('mongodb').MongoClient;
const pid = process.pid;
let id = 0;

function QueueDb() {
	id++;

	const instance = {
		uri: `mongodb://localhost/${pid}-${id}`,
		close() {
			return this.db.dropDatabase().then(() => this.db.close(true));
		}
	};

	return MongoClient.connect(instance.uri)
		.then(db => {
			instance.db = db;
			return instance;
		});
}

module.exports.QueueDb = QueueDb;
