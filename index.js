'use strict';

var monk = require('monk');
var ObjectID = require('monk/node_modules/mongoskin').ObjectID;

function Yajob(uri) {
    if (!(this instanceof Yajob)) { return new Yajob(uri); }

    this._id = new ObjectID();
    this._tag = 'default';
    this._db = monk(uri);
    this._delay = 0;
    this._maxTrys = Infinity;
}

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

    var jobs = this._db.get(this._tag);

    return jobs.insert({
        status: 'new',
        attempts: 0,
        attrs: attrs,
        scheduledAt: opts.schedule || new Date(Date.now() + this._delay),
        priority: opts.priority || 0
    });
};

Yajob.prototype.take = function (count) {
    count = count || 1;

    var now = new Date();
    var maxTrys = this._maxTrys;
    var collection = this._db.get(this._tag);
    var queueId = this._id;
    var sorting = this._sort;

    return collection
        .find({
            status: 'new',
            scheduledAt: { $lte: now }
        }, {limit: count, sort: this._sort})
        .then(function takeJobs(jobs) {
            var ids = jobs.map(function(d) {
                return d._id;
            });

            return collection.update({
                _id: {$in: ids},
                status: 'new'
            }, {
                $set: {
                    status: 'taken',
                    takenBy: queueId
                },
                $currentDate: {
                    takenAt: {$type: 'date'}
                },
                $inc: {attempts: 1}
            }, {
                multi: true
            });
        })
        .then(function getJobs(status) {
            if (status.nModified < 1) {
                return [];
            }

            return collection.find({
                takenBy: queueId
            }, {sort: sorting});
        })
        .then(function emitJobs(batch) {
            return function * () {
                for (var i = 0; i < batch.length; i++) {
                    var job = batch[i];
                    var done = yield job.attrs;

                    if (done === false) {
                        var status = job.attempts < maxTrys ? 'new' : 'failed';
                        collection.update({_id: job._id}, {status: status});
                    } else {
                        collection.remove({_id: job._id});
                    }
                }
            };
        });
};

Yajob.prototype.remove = function (attrs) {
    var collection = this._db.get(this._tag);
    return collection.remove({status: 'new', attrs: attrs});
};

Yajob.prototype.close = function () {
    this._db.close();
};

module.exports = Yajob;
