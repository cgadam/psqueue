/*
  The MIT License (MIT)

  Copyright (c) 2015 Christian Adam

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

/**
  @overview PSQueue module.
  @author Christian Adam
*/

/* jshint node:true */
var Q = require('q');

/**
 * A class representing a Promise
 * @param {function} fn A function returning a Q promise.
 * @param {object} params An array of params to pass to the function.
 */
function Promise(fn, params) {
  this.fn_ = fn;
  this.params_ = params;
}

/**
 * A class representing a Queue of promises
 * that will be solved synchronously.
 *
 */
function PSQueue() {
  this.internalQueu_ = [];
  this.resultsList = [];
}

/**
 * Adds a promise to the queue
 * @param {function} fn A function generating a promise.
 */
PSQueue.prototype.addPromise = function (fn) {
  if (typeof fn !== 'function') {
    throw new Error('You should add functions returning Q promises.');
  }
  var argsLength = arguments.length,
    parameters = [];
  for (var i = 1; i < argsLength; i++) {
    parameters.push(arguments[i]);
  }
  var promise = new Promise(fn, parameters);
  this.internalQueu_.push(promise);
};

/**
 * Resolves all the promises added to the queue in order.
 * @param   {object} torch An optional torch object that will be passed as last parameter in following promises.
 * @returns {object} A Q promise that will be solved once all promises are solved in order. The promise will resolve to an
 *                   array of values corresponding to the resolving values of each promise. If the promise fails it will
 *                   pass the corresponding error.
 */
PSQueue.prototype.resolveAllSync = function (torch) {
  var deferred = Q.defer(),
    self = this;
  if (this.internalQueu_.length !== 0) {
    var promiseObj = this.internalQueu_.shift();
    if (typeof torch === 'object') {
      promiseObj.params_.push(torch);
    }
    try {
      promiseObj.fn_.apply(this, promiseObj.params_).then(function (result) {
        self.resultsList.push(result);
        self.resolveAllSync(torch).then(function (resultsList) {
            deferred.resolve(resultsList);
          })
          .fail(function (err) {
            deferred.reject(err);
          });
      }).fail(function (err) {
        deferred.reject(err);
      });
    } catch (err) {
      deferred.reject(err);
    }
  } else {
    deferred.resolve(self.resultsList);
  }
  return deferred.promise;
};

/**
 * Alias for resolveAllSync
 */
PSQueue.prototype.allSync = function(torch){
  return this.resolveAllSync(torch);
};

/**
 * Alias for resolveAllSync
 */
PSQueue.prototype.all = function(torch){
  return this.resolveAllSync(torch);
};

module.exports = PSQueue;
