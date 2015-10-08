# PSQueue (Promises Sync Queue)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cgadam/psqueue?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![dependencies](https://david-dm.org/cgadam/psqueue.png)](https://david-dm.org/cgadam/psqueue)

### Getting async ducks in a row.

Have you ever find yourself dealing with this problem: you need to execute async operations (encapsulated in Q promises)
in order. The bad thing is that those async operations are dynamically generated and therefore it's not trivial
to chain Q promises with then, then, then.

If this is your case, then this module is for you.

## How to use it?

1. Create a PSQueue.
2. Create your function that returns a Q promise.
3. Add the function to the queue (indicating the parameters)
4. Repeat steps 2 and 3 as many times as you want.
5. Call PSQueue's method resolveAllSync() which will return a Q promise too.

The promise returned by resolveAllSync() will be resolved once ALL the Q promises in the
queue are solved. The good part is that the sync queue resolves all the promises in ORDER: ONE AT THE TIME! :)

The resolved value the promise returned by resolveAllSync() will contain an array with the resolved values of
all the other synchronously executed promises of the queue.

You can optionally define a *torch* object and pass it to resolveAllSync function. The object will be systematically passed between the functions in the queue.
Functions can then modify the value and pass it to the following functions in the queue. You need to be sure that your function will actually proccess this parameter.

Example:

**Q.all** resolves all the promises *asynchronously*. So, in this example:

```javascript
    var Q = require('q');

    var timestamp = (new Date()).getTime();
    var arr = ['A', 'B', 'C'];

    function doPromiseToItem(item) {
      var deferred = Q.defer();
      var randomFactor = 10000 * Math.random()
      setTimeout(function (rand) {
        console.log(item + ' solved after random ' + (Math.round((rand / 1000) * 100) / 100) + ' secs.');
        deferred.resolve(item);
      }, randomFactor, randomFactor);
      return deferred.promise;
    }

    var promises = [];

    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      var promise = doPromiseToItem(item);
      promises.push(promise);
    }

    Q.all(promises).then(function (arrResults) {
      var duration = Math.round(((((new Date()).getTime()) - timestamp) / 1000) * 100) / 100;
      console.log('ALL SOLVED in ' + duration + ' seconds.');
      console.log('Results are:\n' + arrResults.join('\n'));
    });
```
If you execute it:

```bash
    $ cd demos
    $ node QAllTest.js
```
This is one possible output you might get:

```bash
    C solved after random 3.03 secs.
    B solved after random 5.09 secs.
    A solved after random 5.45 secs.
    ALL SOLVED in 5.46 seconds.
    Results are:
    A
    B
    C
```

As you can see *all of the promises ran in parallel* (not in a specific order -> C,B,A) and the time it took to complete
all of them is nothing but the time it took for the latest one to finish.

**PSQueue** runs all the promises *in order* and *one at the time*:
(Example using a torch value)

```javascript
    var Q = require('q'),
      PSQueue = require('../psqueue'),
      timestamp = (new Date()).getTime(),
      arr = ['A', 'B', 'C'],
      promisesQueue = new PSQueue();

    function doPromiseToItem(item, torch) {
      var deferred = Q.defer();
      var randomFactor = 10000 * Math.random();
      setTimeout(function (rand) {
        console.log(item + ' solved after ' + torch.text + ' taking random ' + (Math.round((rand / 1000) * 100) / 100) + ' secs.');
        torch.text = (torch.text === 'BEGGINING OF TIME' ? item : (torch.text + ',' + item));
        deferred.resolve(item + ':OK');
      }, randomFactor, randomFactor);
      return deferred.promise;
    }

    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      promisesQueue.addPromise(doPromiseToItem, item);
    }

    promisesQueue.resolveAllSync({
      text: 'BEGGINING OF TIME'
    }).then(function (arrResults) {
      var duration = Math.round(((((new Date()).getTime()) - timestamp) / 1000) * 100) / 100;
      console.log('ALL SOLVED in ' + duration + ' seconds.');
      console.log('Results are:\n' + arrResults.join('\n'));
    });
```
If you execute it:

```bash
    $ cd demos
    $ node PSQueueTest.js
```
This is one possible output you might get:

```bash
    A solved after BEGGINING OF TIME taking random 9.6 secs.
    B solved after A taking random 5.55 secs.
    C solved after A,B taking random 1.1 secs.
    ALL SOLVED in 16.3 seconds.
    Results are:
    A:OK
    B:OK
    C:OK
```

As you can see no matter how much time each individual promise took to be solved, all of them are executed
in order (A,B,C) and the total time is the sum of the time of each of them. Also you can see how the torch value is modified from function to function appening
the name of the item that was previosuly executed. The result of the promises is then returned in an array (arrResults).

**What if a promise in the queue fails?**

If one promise in the queue fails, then the following promises in the queue are not executed and the rejection value is used for rejecting the queue's promise.

Example:

```javascript
    var Q = require('q'),
      PSQueue = require('../psqueue'),
      timestamp = (new Date()).getTime(),
      arr = ['A', 'B', 'C', 'D'],
      promisesQueue = new PSQueue();

    function doPromiseToItem(item, torch) {
      var deferred = Q.defer();
      var randomFactor = 10000 * Math.random();
      setTimeout(function (obj) {
        if (obj.item === 'C') {
          console.log(item + ' NOT solved after random ' + (Math.round((obj.rand / 1000) * 100) / 100) + ' secs.');
          deferred.reject(obj.item);
          return;
        }
        console.log(item + ' solved after random ' + (Math.round((obj.rand / 1000) * 100) / 100) + ' secs.');
        torch.push(item);
        deferred.resolve();
      }, randomFactor, {
        "rand": randomFactor,
        "item": item
      });
      return deferred.promise;
    }

    for (var i = 0; i < arr.length; i++) {
      var item = arr[i];
      promisesQueue.addPromise(doPromiseToItem, item);
    }

    var partialResult = [];

    promisesQueue.resolveAllSync(partialResult).fail(function (err, arrResults) {
      var duration = Math.round(((((new Date()).getTime()) - timestamp) / 1000) * 100) / 100;
      console.log('FAILED because I found ' + err + ' after ' + duration + ' seconds.');
      console.log('Partial result is: ' + partialResult.join(','));
    });
```

If you execute it:

```bash
    $ cd demos
    $ node PSQueueTestFail.js
```
This is one possible output you might get:

```bash
    A solved after random 7.35 secs.
    B solved after random 5.06 secs.
    C NOT solved after random 4.76 secs.
    FAILED because I found C after 17.2 seconds.
    Partial result is: A,B
```

As you can see **D** was never executed and the torch object has been used to obtain a possible partialResult.

### Alias for resolveAllSync
You can use *all* and *allSync* as alias of resolveAllSync
