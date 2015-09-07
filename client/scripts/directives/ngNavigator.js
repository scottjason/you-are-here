angular.module('SearchPickGo')
  .directive('ngNavigator', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '=',
        formattedAddress: '=',
        showLocationSpinner: '=',
        onLogin: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {});
      },
      controller: ['$scope', '$rootScope', '$state', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $state, $timeout, RequestApi, localStorageService) {

          if (isAuthorized === 'true') {
            localStorageService.set('accessToken', accessToken);
            localStorageService.set('refreshToken', refreshToken);
            localStorageService.set('firstName', firstName);
            $state.go('search');
            return;
          }

          localStorageService.clearAll();
          $scope.startPosition = {};

          $scope.getLocation = function() {
            $scope.showLocationSpinner = true;
            navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
          };

          $scope.onLogin = function() {
            RequestApi.login();
          };

          function onLocationSuccess(position) {
            $scope.startPosition.lat = position.coords.latitude;
            $scope.startPosition.lon = position.coords.longitude;
            localStorageService.set('startPosition', $scope.startPosition);
            reverseGeo();
          }

          function onLocationError() {
            console.error('unable to retreive your location')
          }

          function reverseGeo() {
            var geocoder = new google.maps.Geocoder();
            var latlng = {
              lat: $scope.startPosition.lat,
              lng: $scope.startPosition.lon
            };
            geocoder.geocode({
              'location': latlng
            }, function(results, status) {
              if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                  $timeout(function() {
                    $scope.showLocationSpinner = false;
                    $scope.formattedAddress = results[1].formatted_address;
                    localStorageService.set('formattedAddress', $scope.formattedAddress);
                    console.log(results[1].formatted_address);
                  });
                } else {
                  window.alert('No results found');
                }
              } else {
                window.alert('Geocoder failed due to: ' + status);
              }
            });
          }

        }
      ],
    }
    return directive;
  });
