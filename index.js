'use strict';

var monk = require('monk');
var ObjectID = require('monk/node_modules/mongoskin').ObjectID;

class Yajob {
    constructor (uri) {
        if (!(this instanceof Yajob)) { return new Yajob(uri); }

        this.id = new ObjectID();
        this.tag = 'default';
        this.db = monk(uri);
        this.delay = 0;
        this.maxTrys = Infinity;
    }

    trys (count) {
        this.maxTrys = count;
    }

    delay (ms) {
        this.delay = ms;
    }

    tag (name) {
        this.tag = name;
    }

    put (attrs, opts) {
        opts = opts || {};

        var jobs = this.db.get(this.tag);

        return jobs.insert({
            status: 'new',
            attempts: 0,
            attrs: attrs,
            scheduledAt: opts.schedule || new Date(Date.now() + this.delay)
        });
    }

    take (count) {
        count = count || 1;

        var now = new Date();
        var maxTrys = this.maxTrys;
        var collection = this.db.get(this.tag);
        var queueId = this.id;

        return collection
            .find({
                status: 'new',
                scheduledAt: { $lte: now }
            }, {limit: count})
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
                        takenBy: queueId,
                        takenAt: new Date()
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
                });
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
    }

    close () {
        this.db.close();
    }
}

module.exports = Yajob;
