var Q = require('q');

var Promise = function(fn, params){
  this.fn_ = fn;
  this.params_ = params;
}

var PromisesSyncQueu = function(){
  this.internalQueu_=[];
}

PromisesSyncQueu.prototype.addPromise = function(fn, params){
  if(Object.prototype.toString.call( params ) !== '[object Array]' ) {
    params = [].concat(params);
  }
  var promise = new Promise(fn, params);
  this.internalQueu_.push(promise);
}

PromisesSyncQueu.prototype.resolveAllSync = function(){
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

module.exports = PromisesSyncQueu;