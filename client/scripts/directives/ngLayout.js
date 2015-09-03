angular.module('SearchPickGo')
  .directive('ngLayout', function($timeout, GoogleMaps, RequestApi, DataService, StateService) {

    'use strict';

    var directive = {
      scope: {
        results: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', function($scope) {
        $timeout(function() {
          $scope.results = StateService.data['results'].businesses;
          console.debug('Results', $scope.results);
        });
      }],
    }
    return directive;
    ngLayout.$inject('$timeout', 'GoogleMaps', 'RequestApi', 'DataService', 'StateService');
  });
