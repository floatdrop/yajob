'use strict';

const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const shuffle = require('array-shuffle');

function Yajob(uri, opts) {
	if (!(this instanceof Yajob)) {
		return new Yajob(uri, opts);
	}

	this._tag = 'default';
	this._db = MongoClient.connect(uri, opts);
	this._delay = 0;
	this._maxTrys = Infinity;
}

Yajob.prototype.status = Yajob.status = {
	new: 0,
	taken: 1,
	failed: 2
};

Yajob.prototype.trys = function (count) {
	this._maxTrys = count;
	return this;
};

Yajob.prototype.delay = function (ms) {
	this._delay = ms;
	return this;
};

Yajob.prototype.tag = function (name) {
	this._tag = name;
	return this;
};

Yajob.prototype.sort = function (order) {
	this._sort = order;
	return this;
};

Yajob.prototype.put = function (attrs, opts) {
	opts = opts || {};
	opts.schedule = opts.schedule || new Date(Date.now() + this._delay);
	opts.priority = opts.priority || 0;

	if (!Array.isArray(attrs)) {
		attrs = [attrs];
	}

	function attrsToJob(attrs) {
		return {
			status: Yajob.status.new,
			attempts: 0,
			attrs,
			scheduledAt: opts.schedule,
			priority: opts.priority
		};
	}

	const jobs = this._db.then(db => db.collection(this._tag));

	return jobs.then(c => c.insert(attrs.map(attrsToJob)));
};

Yajob.prototype.putUnique = function (attrs, opts) {
	return this._db
		.then(db => db.collection(this._tag))
		.then(c => c.count({attrs}))
		.then(count => count ? {result: {ok: 0, n: 0}} : this.put(attrs, opts));
};

Yajob.prototype.take = function (count) {
	count = count || 1;

	const now = new Date();
	const maxTrys = this._maxTrys;
	const collection = this._db.then(db => db.collection(this._tag));
	const takeId = new ObjectID();
	const sorting = this._sort;
	const delay = this._delay;

	function takeJobs(jobs) {
		let ids = jobs.map(d => d._id);

		ids = shuffle(ids).splice(0, count);

		const pickedJobs = {
			_id: {$in: ids},
			status: Yajob.status.new
		};

		return collection.then(c => c.update(pickedJobs, {
			$set: {
				status: Yajob.status.taken,
				takenBy: takeId
			},
			$currentDate: {
				takenAt: {$type: 'date'}
			},
			$inc: {attempts: 1}
		}, {multi: true}));
	}

	function getJobs(status) {
		if (status.result.nModified < 1) {
			return [];
		}

		return collection.then(c => c.find({takenBy: takeId}, {sort: sorting}).toArray());
	}

	function returnGenerator(batch) {
		return (function * () {
			const ids = [];
			try {
				for (let i = 0; i < batch.length; i++) {
					const job = batch[i];
					const done = yield job.attrs;

					if (done === false) {
						const status = job.attempts < maxTrys ? Yajob.status.new : Yajob.status.failed;

						const data = {status, scheduledAt: new Date(Date.now() + delay)};
						/* eslint-disable no-loop-func */
						collection.then(c => c.update(
							{_id: job._id},
							{$set: data}
						));
					} else {
						ids.push(job._id);
					}
				}
			} finally {
				if (ids.length) {
					collection.then(c => c.remove({_id: {$in: ids}}));
				}
			}
		})();
	}

	const notTakenJobs = {
		status: Yajob.status.new,
		scheduledAt: {$lte: now}
	};

	return collection
		.then(c => c.find(notTakenJobs, {limit: count * 2, sort: this._sort, fields: {_id: 1}}).toArray())
		.then(takeJobs)
		.then(getJobs)
		.then(returnGenerator);
};

Yajob.prototype.remove = function (attrs) {
	const collection = this._db.then(db => db.collection(this._tag));
	return collection.then(c => c.remove({status: Yajob.status.new, attrs}));
};

Yajob.prototype.close = function (force) {
	return this._db.then(db => db.close(force));
};

module.exports = Yajob;
