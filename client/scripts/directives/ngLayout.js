angular.module('SearchPickGo')
  .directive('ngLayout', function($timeout, GoogleMaps, RequestApi, DataService, StateService) {

    'use strict';

    var directive = {
      scope: {
        results: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', function($scope) {

        navigator.geolocation.getCurrentPosition(success, error);

        function success(position) {
          console.log('on success');
          var startLat = position.coords.latitude;
          var startLon = position.coords.longitude;
          var endLat = 37.778595;
          var endLon = -122.389270;
          var opts = {
            startLat: startLat,
            startLon: startLon,
            endLat: endLat,
            endLon: endLon
          }
          RequestApi.getProductId(opts).then(function(response) {
            console.log(response);
          }, function(err) {
            console.log(err);
          })
        };

        function error() {
          console.log('unable to retreive your location')
        };



        $timeout(function() {
          var results = StateService.data['results'].businesses;
          results.forEach(function(obj) {
            if (obj.snippet_text && obj.snippet_text.length > 130) {
              obj.snippet_text = (obj.snippet_text).slice(0, 130) + ' ...';
            }
            if (obj.name && obj.name.length > 31) {
              obj.name = (obj.name).slice(0, 28) + '...';
            }
          });
          $scope.results = results;
          console.log('results', results);
        });
      }],
    }
    return directive;
    ngLayout.$inject('$timeout', 'GoogleMaps', 'RequestApi', 'DataService', 'StateService');
  });
