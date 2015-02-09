'use strict';

var monk = require('monk');

class Yablogs {
    constructor (uri) {
        if (!(this instanceof Yablogs)) { return new Yablogs(uri); }

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

module.exports = Yablogs;
