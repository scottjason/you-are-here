angular.module('SearchPickGo')
  .directive('ngResults', function() {

    'use strict';

    var directive = {
      scope: {
        results: '=',
        onRequestUber: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $timeout, RequestApi, localStorageService) {

          console.log('### ngResults.js')

          $timeout(function() {
            var results = localStorageService.get('results').businesses;
            results.forEach(function(obj) {
              if (obj.snippet_text && obj.snippet_text.length > 130) {
                obj.snippet_text = (obj.snippet_text).slice(0, 130) + ' ...';
              }
              if (obj.name && obj.name.length > 31) {
                obj.name = (obj.name).slice(0, 28) + '...';
              }
              obj.lat = obj.location.coordinate.latitude;
              obj.lon = obj.location.coordinate.longitude;
            });
            $scope.results = results;
            console.log('results', results);
          });

          $scope.onRequestUber = function(endLat, endLon) {
            RequestApi.requestRide(endLat, endLon).then(function(response) {
              console.log('response', response);
            }, function(err) {
              console.log('err', err);
            });
          }
        }
      ],
    }
    return directive;
  });
