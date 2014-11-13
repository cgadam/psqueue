var Q = require('q');

function Promise(fn, params){
  this.fn_ = fn;
  this.params_ = params;
}

function PromisesSyncQueue(){
  this.internalQueu_=[];
}

PromisesSyncQueue.prototype.addPromise = function(fn){
  var argsLength = arguments.length;
  var parameters = [];
  for(var i=1; i<argsLength; i++){
    parameters.push(arguments[i]);
  }
  var promise = new Promise(fn, parameters);
  this.internalQueu_.push(promise);
}

PromisesSyncQueue.prototype.resolveAllSync = function(){
  var deferred = Q.defer();
  var self = this;
  if(this.internalQueu_.length!==0){
   var promiseObj = this.internalQueu_.shift();
   promiseObj.fn_.apply(this, promiseObj.params_).then(function(){
        self.resolveAllSync().then(function(){
                                deferred.resolve();})
                             .fail(function(err){
                                deferred.reject(err);
                            });
    }).fail(function(err){
      deferred.reject(err);
    });
  }
  else{
    deferred.resolve();
  }
  return deferred.promise;
}

module.exports = PromisesSyncQueue;