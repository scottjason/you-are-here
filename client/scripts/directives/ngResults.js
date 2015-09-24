angular.module('YouAreHere')
  .directive('ngResults', function() {


    var directive = {
      scope: {
        results: '=',
        showLoader: '=',
        showStatus: '=',
        getState: '=',
        requestUber: '=',
        isiOs: '=',
        newSearch: '=',
        showSearchLoader: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', '$rootScope', '$state', '$window', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $state, $window, $timeout, RequestApi, localStorageService) {

          console.log('### ngResults.js');

          $scope.getState = function(key) {
            return localStorageService.get(key);
          };

          $scope.newSearch = function() {
            var isRequesting = $rootScope.isRequesting;
            if (isRequesting) {
              $scope.showSearchLoader = true;
              $rootScope.isSearchBtn = true;
              isReady();
            } else {
              $state.go('search', {
                reload: true
              });
            }

            function isReady() {
              var isRequesting = $rootScope.isRequesting;
              if (isRequesting) {
                $timeout(isReady, 200);
              } else {
                $state.go('search', {
                  reload: true
                });
              }
            }
          };

          $scope.init = function() {
            var filteredArr = [];
            $scope.showSearchLoader = null;
            $rootScope.isLogout = null;
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
                if (obj.location && obj.location.coordinate) {
                  obj.lat = obj.location.coordinate.latitude;
                  obj.lon = obj.location.coordinate.longitude;
                }
                if (!obj.image_url || obj.image_url === '') {
                  obj.image_url = "http://bigpurplebutton.com/sites/default/files/default_images/397_resized_700_700_90_516407cbbe17d_placeholder.jpg";
                }
                if (obj.lat) {
                  filteredArr.push(obj);
                }
              });
              $scope.results = filteredArr;
              $scope.clientId = localStorageService.get('clientId');
              $scope.productId = localStorageService.get('productId');
              $scope.city = localStorageService.get('city');
              $scope.getEstimate($scope.results);
            } else {
              $state.go('search');
            }
          }

          $scope.getEstimate = function(arr) {

            $rootScope.isRequesting = true;

            $scope.arr = [];
            async.eachLimit(arr, 2, makeRequest, onComplete);

            function makeRequest(obj, cb) {

              if ($rootScope.isLogout || $rootScope.isSearchBtn) {
                return cb(true);

              }
              var opts = {};
              opts.start = {};
              opts.end = {};
              opts.start.lat = localStorageService.get('startLat');
              opts.start.lon = localStorageService.get('startLon');
              opts.end.lat = obj.lat;
              opts.end.lon = obj.lon;
              RequestApi.getEstimate(opts).then(function(response) {
                $timeout(function() {
                  console.log('response', response);
                  obj.showEstimate = true;
                  obj.distance = response.data.prices[1].distance;
                  obj.duration = Math.floor(response.data.prices[1].duration / 60);
                  obj.estimate = response.data.prices[1].estimate;
                  $scope.arr.push(obj);
                  if ($rootScope.isLogout || $rootScope.isSearchBtn) {
                    cb(true);
                  } else {
                    cb(null);
                  }
                });
              }, function(err) {
                console.log(err);
              })
            }

            function onComplete(err) {
              $rootScope.isRequesting = null;
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
                  if (results[1]) {
                    $timeout(function() {
                      $scope.showLoader = false;
                      $scope.address = results[1].formatted_address;
                      $scope.encodedPickUp = localStorageService.get('encodedPickUp');
                      $scope.encodedDropOff = encodeURIComponent(angular.copy($scope.address));
                      localStorageService.set('encodedDropOff', $scope.encodedDropOff);
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
              var deepLink = 'uber://?action=setPickup&product_id=' + $scope.productId + '&pickup[formatted_address]=' + $scope.encodedPickUp + '&client_id=' + $scope.clientId + '&dropoff[latitude]=' + endLat + '&dropoff[longitude]=' + endLon + '&dropoff[formatted_address]=' + $scope.encodedDropOff;
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
