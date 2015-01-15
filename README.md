# PSQueue (Promises Sync Queue)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/cgadam/psqueue?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### Getting async ducks in a row.

Have you ever find yourself dealing with this problem: you need to execute async operations (encapsulated in Q promises)
in order. The bad thing is that those async operations are dynamically generated and therefore it's not trivial
to chain Q promises with then, then, then.

If this is your case, then this module is for you.

## How to use it?

1. Create a PSQueue.
2. Generate your Q promise.
3. Add the Q promise to the queue (indicating the parameters)
4. Repeat steps 2 and 3 as many times as you want.
5. Call PSQueue's method resolveAllSync() which will return a Q promise too. This returned promise is solved 
once ALL the Q promises in the queue are solved. The good part is that the sync queue resolves them in ORDER and 
ONE AT THE TIME! :)

Example:

**Q.all** resolves all the promises *asynchronously*. So, in this example:


```javascript
var Q = require('q');

var timestamp = (new Date()).getTime();
var arr = ['A', 'B', 'C'];

function doPromiseToItem(item){
  var deferred = Q.defer();
  var randomFactor = 10000 * Math.random()
  setTimeout(function(rand){
    console.log(item + ' solved after random ' + (Math.round((rand/1000)*100)/100) + ' secs.');
    deferred.resolve();
  }, randomFactor, randomFactor);
  return deferred.promise;
}

var promises = [];

for(var i=0; i<arr.length;i++){
  var item = arr[i];
  var promise = doPromiseToItem(item);
  promises.push(promise);
}

Q.all(promises).then(function(){
  var duration = Math.round(((((new Date()).getTime()) - timestamp)/1000)*100)/100;
  console.log('ALL SOLVED in ' + duration + ' seconds.');
});
```
If you execute it:

```bash
    $ node QAllTest.js
```
This is one possible output you might get:

```bash
    B solved after random 0.25 secs.
    C solved after random 4.05 secs.
    A solved after random 8.95 secs.
    ALL SOLVED in 8.95 seconds.
```

As you can see *all of the promises ran in parallel* (not in a specific order -> B,C,A) and the time it took to complete 
all of them is nothing but the time it took for the latest one to finish.

**PSQueue** runs all the promises *in order* and *one at the time*:

```javascript
var Q = require('q');
var PSQueue = require('psqueue');

var timestamp = (new Date()).getTime();
var arr = ['A', 'B', 'C'];

function doPromiseToItem(item){
  var deferred = Q.defer();
  var randomFactor = 10000 * Math.random()
  setTimeout(function(rand){
    console.log(item + ' solved after random ' + (Math.round((rand/1000)*100)/100) + ' secs.');
    deferred.resolve();
  }, randomFactor, randomFactor);
  return deferred.promise;
}

var promisesQueue = new PSQueue();

for(var i=0; i<arr.length;i++){
  var item = arr[i];
  promisesQueue.addPromise(doPromiseToItem, item);
}

promisesQueue.resolveAllSync().then(function(){
  var duration = Math.round(((((new Date()).getTime()) - timestamp)/1000)*100)/100;
  console.log('ALL SOLVED in ' + duration + ' seconds.');
});
```
If you execute it:

```bash
    $ node PSQueueTest.js
```
This is one possible output you might get:

```bash
    A solved after random 2.47 secs.
    B solved after random 8.79 secs.
    C solved after random 0.88 secs.
    ALL SOLVED in 12.16 seconds.
```

As you can see no matter how much time each individual promise took to be solved, all of them are executed 
in order (A,B,C) and the total time is the sum of the time of each of them.

**What if a promise in the queue fails?**

If one promise in the queue fails, then the following promises in the queue are not executed and the rejection value is returned to the queue where you 
can handle it.

Example:

```javascript
var Q = require('q');
var PSQueue = require('psqueue');

var timestamp = (new Date()).getTime();
var arr = ['A', 'B', 'C', 'D'];

function doPromiseToItem(item){
  var deferred = Q.defer();
  var randomFactor = 10000 * Math.random()
  setTimeout(function(obj){
    if(obj.item === 'C'){
      console.log(item + ' NOT solved after random ' + (Math.round((obj.rand/1000)*100)/100) + ' secs.');
      deferred.reject(obj.item);
      return;
    }
    console.log(item + ' solved after random ' + (Math.round((obj.rand/1000)*100)/100) + ' secs.');
    deferred.resolve();
  }, randomFactor, {"rand":randomFactor,
                    "item" : item});
  return deferred.promise;
}

var promisesQueue = new PSQueue();

for(var i=0; i<arr.length;i++){
  var item = arr[i];
  promisesQueue.addPromise(doPromiseToItem, item);
}

promisesQueue.resolveAllSync().fail(function(err){
  var duration = Math.round(((((new Date()).getTime()) - timestamp)/1000)*100)/100;
  console.log('FAILED because I found ' + err + ' after ' + duration + ' seconds.');
});

```

If you execute it:

```bash
    $ node PSQueueTestFail.js
```
This is one possible output you might get:

```bash
    A solved after random 5.33 secs.
    B solved after random 2.01 secs.
    C NOT solved after random 4.73 secs.
    FAILED because I found C after 12.11 seconds.
```

As you can see **D** was never executed.


**What if one promise needs to pass a value to another promise in the chain?**

This scenario is NOT contemplated by this module as when you create the promises that you want to add to the 
queue you're supposed to provide the exact parameters with which the promise will be called.
