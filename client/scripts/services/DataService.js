angular.module('SearchPickGo')
  .service('DataService', function() {

    'use strict'

    function generateResults(arr) {
      console.log('arr', arr);
    }

    return ({
      generateResults: generateResults
    });
  });
