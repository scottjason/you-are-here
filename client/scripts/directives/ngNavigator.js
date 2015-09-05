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
          navigator.geolocation.getCurrentPosition(success, error);
        }

        function success(position) {
          reverseGeo(position.coords.latitude, position.coords.longitude);
        };

        function error() {
          console.log('unable to retreive your location')
        };

        function reverseGeo(startLat, startLon) {
          var geocoder = new google.maps.Geocoder();
          var latlng = {lat: startLat, lng: startLon};
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
