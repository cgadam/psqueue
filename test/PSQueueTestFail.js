var Q = require('q');
var PSQueue = require('../psqueue');

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