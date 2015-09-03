angular.module('SearchPickGo')
  .service('StateService', function() {

    'use strict'

    var data = {
      'results': []
    };

    return ({
      data: data
    });
  });
