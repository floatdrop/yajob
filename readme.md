# yajob [![Build Status](https://travis-ci.org/floatdrop/yajob.svg?branch=master)](https://travis-ci.org/floatdrop/yajob)

Job queue on MongoDB. It uses atomic writes to grab jobs and exposes generator friendly API.

__Requirements__:

 * IoJS or NodeJS `>= 0.12` with `--harmony`
 * MongoDB `>= 2.6`

## Usage

```js
var yajob = require('yajob');
var mails = yajob('localhost/queuedb')
    .tag('mails');

yield mails.put({
    from: 'floatdrop@gmail.com',
    to: 'nodejs-dev@dev-null.com',
    body: 'Wow!'
});

for (var mail of yield mails.take(100)) {
    yield sendmail(mail);
}
```

Jobs removed from queue, when all jobs are taken from batch.

### Skip jobs

In some cases you will need to skip taken job. To do this pass into generator `false` value:

```js
var jobs = yield mails.take(100);
var job = jobs.next().value;
if (value === 'Ohnoez') {
    job.next(false); // Returns Ohnoez back to queue and get next job
}
```

### Priorities

By default, all jobs have priority `0`. You can specify `sort` for queue, in which jobs will be taken:

```js
var important = queue.tag('mail').sort({priority: -1});
```

## API

### Yajob(uri)

Returns instance of queue, that stores data in MongoDB.

##### uri  
Type: `String`  

MongoDB URI string.

## Methods

### put(attrs, [options])

Add job to queue. Returns `Promise`.

##### attrs
Type: `Object` / `Array`

Data, that will be attached to job. If `attrs` is an `Array` - then every `Object` in `attrs` considered as new job.

##### options
Type: `Object`

 * `schedule` - `Date`, when job should be available to `take`
 * `priority` - `Number`, that represents priority of job

### take([count])

Returns `Promise` that resolves to a `Generator`, that will emit jobs one by one.

After all jobs are taken from batch - they are considered `done` and removed from queue.

##### count
Type: `Number`  
Default: `1`

Maximum number of jobs to take from one batch request.

### remove(attrs)

Removes jobs, that match `attrs` from queue. Returns `Promise`.

### close()

Closes connections to MongoDB.

## Setters

### tag(name)
Default: `default`

Sets `name` of the MongoDB collection, that will be used to save and get jobs.

### delay(milliseconds)

Sets delay for job, that is not scheduled. That is - every job without `schedule` options will be scheduled on `Date() + delay`.

### trys(number)
Default: `Infinity`

Sets maximum job trys, before `failed` status will be assigned.

### sort(order)

Sets sort order rule for `take`. Use this, when you need to get jobs, [sorted by priority](#priorities).

### Job status

* `0` - __new__ job, that was just added to queue
* `1` - __taken__ job, that was assigned to `takenBy` worker
* `2` - __failed__ job, that has more `attemts` than allowed

## License

MIT © [Vsevolod Strukchinsky](floatdrop@gmail.com)
