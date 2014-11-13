var Q = require('q');
var PSQueue = require('../psqueue');

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