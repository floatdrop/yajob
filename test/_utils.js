const MongoClient = require('mongodb').MongoClient;

const pid = process.pid;
var id = 0;

function QueueDb() {
	id++;

	var instance = {
		uri: `mongodb://localhost/${pid}-${id}`,
		close() {
			return this.db.dropDatabase();
		}
	};

	return MongoClient.connect(instance.uri)
		.then(db => {
			instance.db = db;
			return instance;
		});
}

module.exports.QueueDb = QueueDb;
