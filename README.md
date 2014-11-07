# PSQ (Promises Sync Queue)

### Getting async ducks in row.

Have you ever find yourself dealing with this problem: you need to execute async operations in order.
The bad thing is that those async operations are dinamycally generated and therefore is not trivial
to chain Q promises with then, then, then.

If this is your case, then this module if for you.

## How to use it?

1. Create a PSQ.
2. Generate your Q promise.
3. Add it to the queue.
4. Repeat 2-3 as many times as you want.
5. Call queue's method resolveAllSync().

This will return another Q promise that will we solved once ALL the other promises are solved in ORDER.

Example:
```javascript
    var Q = require('q');
    var PromisesSyncQueu = require('../psq');

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

    var promisesQueu = new PromisesSyncQueu();

    for(var i=0; i<arr.length;i++){
      var item = arr[i];
      promisesQueu.addPromise(doPromiseToItem, item);
    }

    promisesQueu.resolveAllSync().then(function(){
      var duration = Math.round(((((new Date()).getTime()) - timestamp)/1000)*100)/100;
      console.log('ALL SOLVED in ' + duration + ' seconds.');
    });
```

Output:
    
    A solved after random 5.21 secs.
    B solved after random 7.37 secs.
    C solved after random 6.74 secs.
    ALL SOLVED in 19.35 seconds.

To see more working examples check out the test folder.
