'use strict';

var monk = require('monk');
var ObjectID = require('monk/node_modules/mongoskin').ObjectID;
var shuffle = require('array-shuffle');

function Yajob(uri) {
	if (!(this instanceof Yajob)) {
		return new Yajob(uri);
	}

	this._tag = 'default';
	this._db = monk(uri);
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

	var jobs = this._db.get(this._tag);

	return jobs.insert(attrs.map(function (obj) {
		return {
			status: Yajob.status.new,
			attempts: 0,
			attrs: obj,
			scheduledAt: opts.schedule,
			priority: opts.priority
		};
	}));
};

Yajob.prototype.take = function (count) {
	count = count || 1;

	var now = new Date();
	var maxTrys = this._maxTrys;
	var collection = this._db.get(this._tag);
	var takeId = new ObjectID();
	var sorting = this._sort;

	function takeJobs(jobs) {
		var ids = jobs.map(function (d) {
			return d._id;
		});

		ids = shuffle(ids).splice(0, count);

		var pickedJobs = {
			_id: {$in: ids},
			status: Yajob.status.new
		};

		return collection.update(pickedJobs, {
			$set: {
				status: Yajob.status.taken,
				takenBy: takeId
			},
			$currentDate: {
				takenAt: {$type: 'date'}
			},
			$inc: {attempts: 1}
		}, {multi: true});
	}

	function getJobs(status) {
		if (status.nModified < 1) {
			return [];
		}

		return collection.find({takenBy: takeId}, {sort: sorting});
	}

	function returnGenerator(batch) {
		return (function * () {
			var ids = [];

			for (var i = 0; i < batch.length; i++) {
				var job = batch[i];
				var done = yield job.attrs;

				if (done === false) {
					collection.update(
						{_id: job._id},
						{status: job.attempts < maxTrys ? Yajob.status.new : Yajob.status.failed}
					);
				} else {
					ids.push(job._id);
				}
			}

			if (ids.length) {
				collection.remove({_id: {$in: ids}});
			}
		})();
	}

	var notTakenJobs = {
		status: Yajob.status.new,
		scheduledAt: {$lte: now}
	};

	return collection
		.find(notTakenJobs, {limit: count * 2, sort: this._sort, fields: {_id: 1}})
		.then(takeJobs)
		.then(getJobs)
		.then(returnGenerator);
};

Yajob.prototype.remove = function (attrs) {
	var collection = this._db.get(this._tag);
	return collection.remove({status: Yajob.status.new, attrs: attrs});
};

Yajob.prototype.close = function () {
	this._db.close();
};

module.exports = Yajob;
