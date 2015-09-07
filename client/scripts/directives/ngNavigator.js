angular.module('SearchPickGo')
  .directive('ngNavigator', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '=',
        formattedAddress: '=',
        showLoader: '=',
        onLogin: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {});
      },
      controller: ['$scope', '$rootScope', '$state', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $state, $timeout, RequestApi, localStorageService) {

          var requestOpts = {};

          if (isAuthorized === 'true') {
            localStorageService.set('accessToken', accessToken);
            localStorageService.set('refreshToken', refreshToken);
            localStorageService.set('firstName', firstName);
            localStorageService.set('uberXId', uberXId);
            $state.go('search');
            return;
          }

          localStorageService.clearAll();

          $scope.getLocation = function() {
            $scope.showLoader = true;
            navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
          };

          $scope.onLogin = function() {
            RequestApi.login($scope.startLat, $scope.startLon);
          };

          function onLocationSuccess(position) {
            $scope.startLat = position.coords.latitude;
            $scope.startLon = position.coords.longitude;
            localStorageService.set('startLat', $scope.startLat);
            localStorageService.set('startLon', $scope.startLon);
            reverseGeo();
          }

          function onLocationError() {
            console.error('unable to retreive your location')
          }

          function reverseGeo() {
            var geocoder = new google.maps.Geocoder();
            var latlng = {
              lat: $scope.startLat,
              lng: $scope.startLon
            };
            geocoder.geocode({
              'location': latlng
            }, function(results, status) {
              if (status === google.maps.GeocoderStatus.OK) {
                if (results[1]) {
                  $timeout(function() {
                    $scope.showLoader = false;
                    $scope.formattedAddress = results[1].formatted_address;
                    localStorageService.set('formattedAddress', $scope.formattedAddress);
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
