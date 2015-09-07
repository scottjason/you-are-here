angular.module('SearchPickGo')
  .directive('ngNavigator', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '=',
        onSubmit: '=',
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
            console.log('isAuthorized');
          }

          $scope.position = {};
          $scope.requestOpts = {};

          $scope.getLocation = function() {
            $scope.showLocationSpinner = true;
            navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
          };

          $scope.onLogin = function() {
            RequestApi.login();
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
            localStorageService.set('position', $scope.position);
            reverseGeo();
          }

          function onLocationError() {
            console.error('unable to retreive your location')
          }

          function reverseGeo() {
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
