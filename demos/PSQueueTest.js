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
  @overview A test file for showing how to use PSQueue. This test represent a happy scenario.
  @author Christian Adam
*/

/* jshint node:true */
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
