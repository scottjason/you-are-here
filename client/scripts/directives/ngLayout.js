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
          var results = StateService.data['results'].businesses;
          results.forEach(function(obj) {
            if (obj.snippet_text && obj.snippet_text.length > 150) {
              obj.snippet_text = (obj.snippet_text).slice(0, 150) + '...';
            }
          });
          $scope.results = results;
        });
      }],
    }
    return directive;
    ngLayout.$inject('$timeout', 'GoogleMaps', 'RequestApi', 'DataService', 'StateService');
  });
