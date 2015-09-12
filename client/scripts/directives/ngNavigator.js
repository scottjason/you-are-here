angular.module('YouAreHere')
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
      link: function(scope, element, attrs) {},
      controller: ['$scope', '$rootScope', '$state', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $state, $timeout, RequestApi, localStorageService) {

          var requestOpts = {};

          if (isAuthorized || localStorageService.get('isAuthorized')) {
            localStorageService.set('isAuthorized', true);
            localStorageService.set('firstName', firstName);
            localStorageService.set('lastName', lastName);
            localStorageService.set('email', email);
            localStorageService.set('productId', productId);
            localStorageService.set('clientId', clientId);
            $state.go('search');
            return;
          }

          console.log('### ngNavigator.js')

          localStorageService.clearAll();

          $scope.getLocation = function() {
            $scope.showLoader = true;
            navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, {
              enableHighAccuracy: true,
              maximumAge: 600000,
              timeout: 600000
            });
          };

          $scope.onLogin = function() {
            RequestApi.onLogin($scope.startLat, $scope.startLon);
          };

          function onLocationSuccess(position) {
            $scope.startLat = position.coords.latitude;
            $scope.startLon = position.coords.longitude;
            localStorageService.set('startLat', $scope.startLat);
            localStorageService.set('startLon', $scope.startLon);
            reverseGeo();
          }

          function onLocationError() {
            window.alert("Your browser doesn't support geolocation.");
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
                if (results[0]) {
                  $timeout(function() {
                    $scope.showLoader = false;
                    $scope.address = results[0].formatted_address;
                    var encodedAddress = encodeURIComponent(angular.copy($scope.address));
                    $scope.formattedAddress = results[1].formatted_address;
                    $scope.streetNumber = results[0].address_components.short_name;
                    $scope.streetName = results[1].address_components.short_name;
                    $scope.city = angular.copy($scope.formattedAddress).split(',')[1];
                    $scope.state = angular.copy($scope.formattedAddress).split(',')[2];
                    $scope.zipcode = angular.copy($scope.formattedAddress).split(',')[3];
                    localStorageService.set('streetNumber', $scope.streetNumber);
                    localStorageService.set('streetName', $scope.streetName);
                    localStorageService.set('city', $scope.city);
                    localStorageService.set('state', $scope.state);
                    localStorageService.set('zipcode', $scope.zipcode);
                    localStorageService.set('address', $scope.address);
                    localStorageService.set('encodedAddress', $scope.encodedAddress);
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
