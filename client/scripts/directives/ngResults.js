angular.module('YouAreHere')
  .directive('ngResults', function() {

    'use strict';

    var directive = {
      scope: {
        results: '=',
        showLoader: '=',
        showStatus: '=',
        getState: '=',
        requestUber: '=',
        isiOs: '=',
        newSearch: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', '$rootScope', '$state', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $state, $timeout, RequestApi, localStorageService) {

          console.log('### ngResults.js');

          var stopRequest = null;

          $scope.getState = function(key) {
            return localStorageService.get(key);
          };

          $scope.newSearch = function() {
            console.log('stop reqeust')
            $rootScope.isSearchBtn = true;
            stopRequest = true;
            $state.go('search');
          }

          $scope.init = function() {
            stopRequest = null;
            $rootScope.isSearchBtn = null;
            $scope.isiOs = localStorageService.get('isiOS');
            var results = localStorageService.get('results').businesses || localStorageService.get('results');
            if (results && results.length) {
              results.forEach(function(obj) {
                if (obj.snippet_text && obj.snippet_text.length > 121) {
                  obj.snippet_text = (obj.snippet_text).slice(0, 118) + '...';
                }
                if (obj.name && obj.name.length > 29) {
                  obj.name = (obj.name).slice(0, 26) + '...';
                }
                if (!obj.status) {
                  obj.status = '.. loading ..';
                }
                if (obj.eta) {
                  obj.eta = obj.eta ? (obj.eta + ' minutes') : ('.. loading ..');
                }
                obj.lat = obj.location.coordinate.latitude;
                obj.lon = obj.location.coordinate.longitude;
              });
              $scope.results = results;
              $scope.clientId = localStorageService.get('clientId');
              $scope.productId = localStorageService.get('productId');
              $scope.city = localStorageService.get('city');
              $scope.formattedAddress = localStorageService.get('formattedAddress');
              $scope.encodedAddress = localStorageService.get('encodedAddress');
              $scope.getEstimate($scope.results);
            } else {
              $state.go('search');
            }
          }

          $scope.getEstimate = function(arr) {

            $scope.arr = [];
            async.eachLimit(arr, 2, makeRequest, onComplete);

            function makeRequest(obj, cb) {
              console.log('in makeRequest', stopRequest);
              if (stopRequest) return cb(true);
              var opts = {};
              opts.start = {};
              opts.end = {};
              opts.start.lat = localStorageService.get('startLat');
              opts.start.lon = localStorageService.get('startLon');
              opts.end.lat = obj.lat;
              opts.end.lon = obj.lon;
              RequestApi.getEstimate(opts).then(function(response) {
                $timeout(function() {
                  console.log('got response', response);
                  obj.showEstimate = true;
                  obj.distance = response.data.prices[1].distance;
                  obj.duration = Math.floor(response.data.prices[1].duration / 60);
                  obj.estimate = response.data.prices[1].estimate;
                  $scope.arr.push(obj);
                  cb(null);
                });
              }, function(err) {
                console.log(err);
              })
            }

            function onComplete(err) {
              console.log('onComplete called');
              if (err) return;
              localStorageService.set('results', $scope.arr);
            }
          };

          $scope.requestUber = function(endLat, endLon) {

            function reverseGeo(cb) {
              var geocoder = new google.maps.Geocoder();
              var latlng = {
                lat: endLat,
                lng: endLon
              };
              geocoder.geocode({
                'location': latlng
              }, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK) {
                  if (results[0]) {
                    $timeout(function() {
                      $scope.showLoader = false;
                      $scope.address = results[0].formatted_address;
                      $scope.encodedAddress = encodeURIComponent(angular.copy($scope.address));
                      localStorageService.set('encodedAddress', $scope.encodedAddress);
                      cb();
                    });
                  } else {
                    window.alert('No results found');
                  }
                } else {
                  window.alert('Geocoder failed due to: ' + status);
                }
              });
            }

            function onSuccess() {
              var isiOS = localStorageService.get('isiOS', isiOS);
              var deepLink = 'uber://?action=setPickup&product_id=' + $scope.productId + '&pickup=my_location&client_id=' + $scope.clientId + '&dropoff[latitude]=' + endLat + '&dropoff[longitude]=' + endLon + '&dropoff[formatted_address]=' + $scope.encodedAddress;
              if (isiOS) {
                window.location = deepLink;
              } else {
                console.log('not isiOS', endLat, endLon, $scope.encodedAddress);
              }
            }
            reverseGeo(onSuccess);
          };
          $scope.init();
        }
      ],
    }
    return directive;
  });
