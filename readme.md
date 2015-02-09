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

Coming soon

## put

## update

## take

## delete
