'use strict';

var monk = require('monk');

class Yajob {
    constructor (uri) {
        if (!(this instanceof Yajob)) { return new Yajob(uri); }

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
        var jobs = this.db.get(this.tag);
        return jobs.insert({
            status: 'new',
            createdAt: new Date(),
            attempts: 0,
            attrs: attrs,
            scheduledAt: opts.schedule || new Date(Date.now() + this.delay)
        });
    }

    take (count) {
        count = count || 1;
        var now = new Date();
        var trys = this.maxTrys;

        var collection = this.db.get(this.tag);
        return collection
            .findAndModify({
                query: {
                    status: 'new',
                    scheduledAt: { $lte: now }
                },
                update: {
                    status: 'taken',
                    takenAt: now,
                    $inc: { attempts: 1 }
                }
            }, {limit: count})
            .then(function (batch) {
                return function * () {
                    for (var i = 0; i < batch.length; i++) {
                        var job = batch[i];
                        var done = yield job.attrs;

                        if (done === false) {
                            var status = job.attempts > trys ? 'failed' : 'new';
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
