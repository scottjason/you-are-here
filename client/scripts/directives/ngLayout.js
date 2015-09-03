angular.module('SearchPickGo')
  .directive('ngLayout', function(GoogleMaps, RequestApi, StateService) {

    'use strict';

    var directive = {
      scope: {},
      link: function(scope, element, attrs) {
        element.bind('click', function($event) {
          console.log('clicked in ngLayout')
        });
      },
      controller: ['$scope', function($scope) {
        console.log('contrller called in ngLayout');
        var results = StateService.data['results'];
        console.log(results);
      }],
    }
    return directive;
    ngLayout.$inject('GoogleMaps', 'RequestApi', 'StateService');
  });
