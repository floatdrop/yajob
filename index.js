'use strict';

var monk = require('monk');

class Yajob {
    constructor (uri) {
        if (!(this instanceof Yajob)) { return new Yajob(uri); }

        this.tag = 'default';
        this.db = monk(uri);
    }

    tag (name) {
        this.tag = name;
    }

    put (attrs) {
        var jobs = this.db.get(this.tag);
        return jobs.insert({
            createdAt: new Date(),
            attrs: attrs
        });
    }

    take (count) {
        count = count || 1;

        var jobs = this.db.get(this.tag);
        return jobs.findAndModify({ update: { status: 'taken', takenAt: new Date() } }, {limit: count});
    }

    close () {
        this.db.close();
    }
}

module.exports = Yajob;
