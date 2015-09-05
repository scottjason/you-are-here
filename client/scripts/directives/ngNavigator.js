angular.module('SearchPickGo')
  .directive('ngNavigator', function($state, GoogleMaps, RequestApi, StateService) {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '=',
        onSubmit: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {});
      },
      controller: ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {

        $scope.position = {};
        $scope.requestOpts = {};

        $scope.getLocation = function() {
          navigator.geolocation.getCurrentPosition(success, error);
        }

        $scope.onSubmit = function() {
          $scope.requestOpts.term = 'dinner';
          $scope.requestOpts.city = 'San Francisco';
          RequestApi.searchYelp($scope.requestOpts).then(function(response) {
            StateService.data['results'] = response.data;
            console.log(response.data)
            $state.go('results');
          }, function(err) {
            console.log(err);
          });
        };


        function success(position) {
          $scope.position.startLat = position.coords.latitude;
          reverseGeo(position.coords.latitude, position.coords.longitude);
        };

        function error() {
          console.log('unable to retreive your location')
        };

        function reverseGeo(startLat, startLon) {
          var geocoder = new google.maps.Geocoder();
          var latlng = {
            lat: startLat,
            lng: startLon
          };
          geocoder.geocode({
            'location': latlng
          }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                console.log(results[1].formatted_address);
              } else {
                window.alert('No results found');
              }
            } else {
              window.alert('Geocoder failed due to: ' + status);
            }
          });
        }

      }],
    }
    return directive;
    ngNavigator.$inject('$state', 'GoogleMaps', 'RequestApi', 'StateService');
  });
