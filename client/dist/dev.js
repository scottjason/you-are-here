'use strict';

angular.module('YouAreHere', [
  'ui.router',
  'LocalStorageModule'
]);

'use strict';

angular.module('YouAreHere')
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, localStorageServiceProvider) {

    $stateProvider
      .state('landing', {
        url: '/',
        templateUrl: 'views/landing.html'
      })
      .state('search', {
        url: '/search',
        templateUrl: 'views/search.html'
      })
      .state('results', {
        url: '/results',
        templateUrl: 'views/results.html'
      })

    localStorageServiceProvider
      .setPrefix('YouAreHere')
      .setNotify(true, true);

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  });

'use strict';

angular.module('YouAreHere')
  .run(['localStorageService', function(localStorageService) {
    var isiPad = navigator.userAgent.match(/iPad/i) != null;
    var isiPhone = !isiPad && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null));
    var isiOS = isiPad || isiPhone;
    localStorageService.set('isiOS', isiOS);
  }]);

angular.module('YouAreHere')
  .directive('ngNavbar', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        onLogout: '='
      },
      link: function(scope, element, attrs) {},
      templateUrl: 'views/navbar.html',
      controller: ['$scope', '$timeout', '$state', '$window', 'RequestApi', 'localStorageService',
        function($scope, $timeout, $state, $window, RequestApi, localStorageService) {

          console.log('### ngNavbar.js');

          $timeout(function() {
            $scope.firstName = localStorageService.get('firstName');
          });

          $scope.onLogout = function() {
            RequestApi.onLogout().then(function(response) {
              $timeout(function() {
                localStorageService.clearAll();
                $window.location.reload();
              })
            }, function(err) {
              localStorageService.clearAll();
              $window.location.reload();
            });
          }
        }
      ],
    }
    return directive;
  });

angular.module('YouAreHere')
  .directive('ngNavigator', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '=',
        formattedAddress: '=',
        showLoader: '=',
        onLogin: '=',
        showResults: '=',
        lineOne: '=',
        lineTwo: '='
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
                    $scope.showResults = true;
                    $scope.address = results[0].formatted_address;
                    $scope.encodedAddress = encodeURIComponent(angular.copy($scope.address));
                    $scope.formattedAddress = results[1].formatted_address;
                    var arr = angular.copy($scope.formattedAddress.split(','));
                    $scope.lineOne = arr[0];
                    arr.shift();
                    arr = arr.join(',');
                    $scope.lineTwo = arr;
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

angular.module('YouAreHere')
  .directive('ngResults', function() {

    'use strict';

    var directive = {
      scope: {
        results: '=',
        showLoader: '=',
        showStatus: '=',
        getState: '=',
        requestUber: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $timeout, RequestApi, localStorageService) {

          console.log('### ngResults.js');

          $scope.getState = function(key) {
            return localStorageService.get(key);
          };

          $timeout(function() {
            var results = localStorageService.get('results').businesses || localStorageService.get('results');
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
            var isLoaded = localStorageService.get('isLoaded');
            if (!isLoaded) {
              $scope.getEstimate($scope.results);
            }
          });

          $scope.getEstimate = function(arr) {

            $scope.arr = [];
            async.eachLimit(arr, 2, makeRequest, onComplete);

            function makeRequest(obj, cb, i) {
              var opts = {};
              opts.start = {};
              opts.end = {};
              opts.start.lat = localStorageService.get('startLat');
              opts.start.lon = localStorageService.get('startLon');
              opts.end.lat = obj.lat;
              opts.end.lon = obj.lon;
              RequestApi.getEstimate(opts).then(function(response) {
                $timeout(function() {
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

            function onComplete() {
              localStorageService.set('results', $scope.arr);
              localStorageService.set('isLoaded', true);
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
        }
      ],
    }
    return directive;
  });

angular.module('YouAreHere')
  .directive('ngSearch', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        searchTerm: '=',
        onSearch: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {
          var isEnterBtn = ($event.which === 13);
          if (isEnterBtn) {
            scope.$parent.onSearch();
          }
        });
      },
      controller: ['$scope', '$rootScope', '$timeout', '$state', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $timeout, $state, RequestApi, localStorageService) {

          console.log('### ngSearch.js');

          init();

          function init() {
            if (!isAuthorized) {
              localStorageService.clearAll();
              $state.go('landing');
            } else {
              $scope.formattedAddress = localStorageService.get('formattedAddress');
              $scope.isAuthorized = localStorageService.get('isAuthorized');
              $scope.city = localStorageService.get('city');
            }
          }

          $scope.onSearch = function(isLogin) {
            if (!$scope.isAuthorized) {
              localStorageService.clearAll();
              $state.go('landing');
              return;
            }
            if ($scope.searchTerm) {
              var requestOpts = {};
              RequestApi.searchYelp($scope.searchTerm, $scope.city).then(function(response) {
                localStorageService.set('results', response.data);
                $state.go('results');
              }, function(err) {
                console.log(err);
              });
            } else {
              console.log('bad submit', $scope);
            }
          };
        }
      ],
    }
    return directive;
  });

angular.module('YouAreHere')
  .service('RequestApi', function($http) {

    'use strict'

    function searchYelp(term, city) {
      var request = $http({
        method: 'GET',
        url: '/search-yelp/' + term + '/' + city
      });
      return (request.then(successHandler, errorHandler));
    }

    function onLogin(startLat, startLon) {
      window.location.href = window.location.protocol + '//' + window.location.host + '/login/' + startLat + '/' + startLon;
    }

    function onLogout() {
      var request = $http({
        method: 'GET',
        url: '/logout'
      });
      return (request.then(successHandler, errorHandler));
    }

    function getEstimate(params) {
      var request = $http({
        method: 'POST',
        url: '/estimate',
        data: params
      });
      return (request.then(successHandler, errorHandler));
    }

    function cancelRide(requestId) {
      var request = $http({
        method: 'GET',
        url: '/cancel-ride/' + requestId
      });
      return (request.then(successHandler, errorHandler));
    }

    function getRideStatus(requestId) {
      var request = $http({
        method: 'GET',
        url: '/get-ride-status/' + requestId
      });
      return (request.then(successHandler, errorHandler));
    }

    function updateRideStatus(requestId, status) {
      var request = $http({
        method: 'GET',
        url: '/update-ride-status/' + requestId + '/' + status
      });
      return (request.then(successHandler, errorHandler));
    }

    function successHandler(response) {
      return (response);
    }

    function errorHandler(response) {
      return (response);
    }

    return ({
      onLogin: onLogin,
      onLogout: onLogout,
      searchYelp: searchYelp,
      getEstimate: getEstimate,
      cancelRide: cancelRide,
      getRideStatus: getRideStatus,
      updateRideStatus: updateRideStatus
    });
    RequestApi.$inject('http');
  });
