angular.module('SearchPickGo')
  .directive('ngNavigator', function($state, $timeout, GoogleMaps, RequestApi, StateService) {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '=',
        onSubmit: '=',
        formattedAddress: '=',
        showLocationSpinner: '=',
        showOneMoment: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {});
      },
      controller: ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {

        $scope.position = {};
        $scope.requestOpts = {};

        $scope.$watch('showOneMoment', function() {
          if ($scope.showOneMoment) {
            $timeout(function() {
              $scope.showOneMoment = false;
            }, 2400);
          }
        })

        $scope.getLocation = function() {
          $scope.showLocationSpinner = true;
          $scope.showOneMoment = true;
          navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
        };

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

        function onLocationSuccess(position) {
          $scope.position.startLat = position.coords.latitude;
          $scope.position.startLon = position.coords.longitude;
          reverseGeo();
        }

        function onLocationError() {
          console.error('unable to retreive your location')
        }

        function reverseGeo(startLat, startLon) {
          var geocoder = new google.maps.Geocoder();
          var latlng = {
            lat: $scope.position.startLat,
            lng: $scope.position.startLon
          };
          geocoder.geocode({
            'location': latlng
          }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                $timeout(function() {
                  if ($scope.showOneMoment) {
                    $scope.showOneMoment = false;
                    $timeout(function() {
                      $scope.showLocationSpinner = false;
                      $scope.formattedAddress = results[1].formatted_address;
                      console.log(results[1].formatted_address);
                    }, 1600)

                  } else {
                    $scope.showLocationSpinner = false;
                    $scope.formattedAddress = results[1].formatted_address;
                    console.log(results[1].formatted_address);
                  }
                });
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
    ngNavigator.$inject('$state', '$timeout', 'GoogleMaps', 'RequestApi', 'StateService');
  });
