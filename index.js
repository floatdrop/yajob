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

    put () {
        var jobs = this.db.get(this.tag);
        return jobs.insert({});
    }

    close () {
        this.db.close();
    }
}

module.exports = Yablogs;
