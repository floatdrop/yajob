# yajob [![Build Status](https://travis-ci.org/floatdrop/yajob.svg?branch=master)](https://travis-ci.org/floatdrop/yajob)

> Job queue with tags, priorities and scheduled jobs

## Usage

```js
var queue = require('yajob')('localhost/queuedb');

var mails = queue.tag('mail');

yield mails.put({
    from: 'floatdrop@yandex-team.ru',
    to: 'nodejs-dev@yandex-team.ru',
    body: 'Wow!'
});

for (var mail of mails.take(100)) {
    yield sendmail(mail);
}
```

## API

### Yajob(uri)

Returns instance of queue, that stores data in MongoDB.

#### uri  
Type: `String`  

MongoDB URI string.

## Methods

### put(attrs, [options])

Add job to queue.

### take([count])

Returns `Iterator`, that will emit jobs one by one. After every `next` previous job considered done.

##### count
Type: `Number`  
Default: `1`

Number of jobs to take.
