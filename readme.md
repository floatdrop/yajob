# yajob [![Build Status](https://travis-ci.org/floatdrop/yajob.svg?branch=master)](https://travis-ci.org/floatdrop/yajob)

> Yet another job queue with tags, priorities and scheduled jobs

This is implementation of job queue with MongoDB. As like other attempts it utilizes atomic `findAndModify` to grab jobs, but with much more simple API to use it:

## Usage

```js
var queue = require('yajob')('localhost/queuedb');

var mails = queue.tag('mail');

yield mails.put({
    from: 'floatdrop@yandex-team.ru',
    to: 'nodejs-dev@yandex-team.ru',
    body: 'Wow!'
});

var jobs = yield mails.take(100);

for (var mail of jobs) {
    yield sendmail(mail);
}
```

Job considered `done`, when `next` method on iterator from `take` is called.

## API

### Yajob(uri)

Returns instance of queue, that stores data in MongoDB.

#### uri  
Type: `String`  

MongoDB URI string.

## Methods

### put(attrs, [options])

Add job to queue. Returns `Promise`.

### take([count])

Returns `Promise` that resolves to a `Generator`, that will emit jobs one by one.

After every `next` previous job considered done.

##### count
Type: `Number`  
Default: `1`

Number of jobs to take.
