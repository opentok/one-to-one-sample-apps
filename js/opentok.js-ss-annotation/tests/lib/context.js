(function(global) {
  'use strict';

  /* Based on the code found in: https://coderwall.com/p/teiyew */
  global.newContext = function newContext(fakes) {
    fakes = fakes || {};

    var fakeMap = {};
    Object.getOwnPropertyNames(fakes).forEach(function(moduleToFake) {
      var fakeName = 'fake_' + moduleToFake;
      define(fakeName, function() { return fakes[moduleToFake]; });
      fakeMap[moduleToFake] = fakeName;
    });

    var contextualizedRequire = require.config({
      context: 'context_' + Date.now() + '_' + Math.random(),
      map: {
        "*": fakeMap
      }
    });

    return contextualizedRequire;
  };

  global.newContext.configurePaths = function(paths) {
    contextPaths = paths;
  };

}(this));
