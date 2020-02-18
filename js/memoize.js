// Memoization technique.
// Try it. Open up the console on your browser and run:
// isPrime(5); // returns a boolean
// or someFunc('foo', 10); // returns an object
// The first time it will do the calculation and store the result,
// so next time you run isPrime(5) it will retrieve the result from
// the function's cache. The result is also stored in local storage
// so that it doesn't have to recalculate if you refresh the page.
// It'll retrieve the stored result from local storage.

// Check for Local Storage Support
function supportLocalStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] != null;
  } catch (e) {
    return false;
  }
}

// Memoization function.
Function.prototype.memoized = async function() {
  // Values object for caching results. 
  this._values = this._values || {};
  // Stringify function arguments to make key.
  var key = JSON.stringify(Array.prototype.slice.call(arguments));

  // Check if result is cached
  if (this._values[key] !== undefined) {
    //console.log('Loaded from cache: %s => %s', key, this._values[key]);
    return this._values[key];

  // Check if result is in local storage.
  } else if (supportLocalStorage() && localStorage[this.name+':'+key]) {
    //console.log('Loaded from local storage: %s => %s', key, localStorage[this.name+':'+key]);
    return JSON.parse(localStorage[this.name+':'+key]);

    // Call the original function if result not found and store result.
  } else {
    var value = await this.apply(this, arguments);
    // Store in local storage.
    if (supportLocalStorage()) {
      localStorage[this.name+':'+key] = JSON.stringify(value);
    }
    //console.log('New result: %s => %s', key, value);
    return this._values[key] = value;
  }
};

// Call the memoization function with the original function arguments.
Function.prototype.memoize = function() {
  var fn = this;
  return function() {
    return fn.memoized.apply(fn, arguments);
  };
};


// // Check if number is prime function.
// var isPrime = (function isPrime(num) {
//   var prime = num != 1;
//   for (var i = 2; i < num; i++) {
//     if (num % i == 0) {
//       prime = false;
//       break;
//     }
//   }
//   return prime;
// }).memoize(); // Make function memoizable.

// // Some function that accepts arguments and returns an object.
// var someFunc = (function obj(a,b,c) {
//   return {foo: (new Date()).getTime()};
// }).memoize();