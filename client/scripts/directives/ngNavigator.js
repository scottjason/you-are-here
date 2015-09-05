angular.module('SearchPickGo')
  .directive('ngNavigator', function($state, GoogleMaps, RequestApi, StateService) {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {});
      },
      controller: ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {
        $scope.getLocation = function() {
          console.log('getlocation called');
        }
      }],
    }
    return directive;
    ngNavigator.$inject('$state', 'GoogleMaps', 'RequestApi', 'StateService');
  });
