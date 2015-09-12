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
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {});
      },
      controller: ['$scope', '$rootScope', '$state', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $state, $timeout, RequestApi, localStorageService) {

          // Parse the user agent to determine the device
          var isiPad = navigator.userAgent.match(/iPad/i) != null,
            isiPhone = !isiPad && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null)),
            isiOS = isiPad || isiPhone,
            isAndroid = !isiOS && navigator.userAgent.match(/android/i) != null,
            isMobile = isiOS || isAndroid,
            isDesktop = !isMobile;

          // Define all the potential redirection Urls
          var deepLink = 'uber://?action=setPickup&pickup=my_location&dropoff%5Blatitude%5D=33.784685&dropoff%5Blongitude%5D=-84.4121&dropoff%5Bnickname%5D=Apartment%20of%20Paul%20Jump&dropoff%5Bformatted_address%5D=1100%20Howell%20Mill%20RD%2C%20Atlanta%2C%20GA%2030318',
            appStoreUrl = 'https://itunes.apple.com/us/app/uber/id368677368',
            androidIntentUrl = 'intent://uber/#Intent;package=com.ubercab;scheme=uber;end',
            muberDotCom = 'http://m.uber.com';

          // Handle each case with a seamless fallback to the application store on mobile devices
          if (isiOS) {
            window.location = deepLink;
            setTimeout(function() {
              window.location = appStoreUrl;
            }, 25);
          } else if (isAndroid) {
            window.location = androidIntentUrl;
          } else if (isDesktop) {
            console.log('isDesktop');
            // window.location = muberDotCom;
          }

          var requestOpts = {};

          if (isAuthorized || localStorageService.get('isAuthorized')) {
            localStorageService.set('isAuthorized', true);
            localStorageService.set('firstName', firstName);
            localStorageService.set('lastName', lastName);
            localStorageService.set('email', email);
            localStorageService.set('productId', productId);
            $state.go('search');
            return;
          }

          console.log('### ngNavigator.js')

          localStorageService.clearAll();

          $scope.getLocation = function() {
            $scope.showLoader = true;
            navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
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
                if (results[0]) {
                  $timeout(function() {
                    $scope.showLoader = false;
                    $scope.address = results[0].formatted_address;
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
