angular.module('SearchPickGo')
  .directive('ngAutoComplete', function(GoogleMaps, RequestApi) {

    'use strict';

    var directive = {
      restrict: 'A',
      link: function(scope, element, attrs) {
        element.bind('click', function($event) {});
      },
      controller: ['$scope', function($scope) {

        $scope.location = {};

        $scope.onAutoComplete = function() {
          GoogleMaps.generateLocation($scope.autoComplete.getPlace(), function(err, city, state) {
            $scope.location.city = city;
            $scope.location.state = state;
            if (err) console.log(err);
            RequestApi.searchYelp($scope.location).then(function(response) {
            }, function(err) {
              console.log(err);
            })
          });
        };

        function init() {
          $scope.autoComplete = GoogleMaps.addEventListener('autocomplete', $scope.onAutoComplete);
        }
        init();
      }],
    }
    return directive;
    ngAutoComplete.$inject('GoogleMaps', 'RequestApi');
  });
