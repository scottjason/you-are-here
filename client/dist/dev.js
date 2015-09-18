
angular.module('YouAreHere', [
  'ui.router',
  'LocalStorageModule'
]);

'use strict';

angular.module('YouAreHere')
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, localStorageServiceProvider) {

    var isProduction = ((window.location.origin.indexOf('localhost:3000') === -1));
    if (isProduction) {
      window.console.log = function() {
        return false;
      }
    }

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
      .setNotify(true, true);

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  });

angular.module('YouAreHere')
  .run(['$rootScope', '$state', '$location', 'localStorageService', function($rootScope, $state, $location, localStorageService) {
    var isiPad = navigator.userAgent.match(/iPad/i) != null;
    var isiPhone = !isiPad && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null));
    var isiOS = isiPad || isiPhone;
    localStorageService.set('isiOS', isiOS);

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams) {
        var isBackBtn = (fromState.name === 'results' && toState.name === 'search' && !$rootScope.isSearchBtn);
        if (isBackBtn) {
          event.preventDefault();
          $state.transitionTo('results', {reload: false});
        }
      }
    )
  }]);

angular.module('YouAreHere')
  .directive('ngNavbar', function() {

    var directive = {
      restrict: 'A',
      scope: {
        onLogout: '='
      },
      link: function(scope, element, attrs) {},
      templateUrl: 'views/navbar.html',
      controller: ['$scope', '$rootScope', '$timeout', '$state', '$window', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $timeout, $state, $window, RequestApi, localStorageService) {

          console.log('### ngNavbar.js');

          $scope.onLogout = function() {
              $rootScope.isLogout = true;
              var isRequesting = $rootScope.isRequesting;
              if (isRequesting) {
                isReady();
              } else {
                onReady();
              }

              function isReady() {
                var isRequesting = $rootScope.isRequesting;
                if (isRequesting) {
                  $timeout(isReady, 200);
                } else {
                  $rootScope.isLogout = null;
                  onReady();
                }
              }

              function onReady() {
                localStorageService.clearAll();
                isAuthorized = null;
                localStorageService.set('isRedirect', true);
                RequestApi.onLogout().then(function() {
                  window.location.href = window.location.protocol + '//' + window.location.host;
                })
              }
          }
        }
      ],
    }
    return directive;
  });

angular.module('YouAreHere')
  .directive('ngNavigator', function() {

    var directive = {
      restrict: 'A',
      scope: {
        getLocation: '=',
        formattedAddress: '=',
        showLoader: '=',
        onLogin: '=',
        showResults: '=',
        lineOne: '=',
        lineTwo: '=',
        isSupported: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', '$rootScope', '$state', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $state, $timeout, RequestApi, localStorageService) {

          console.log('ngNavigator')

          $scope.isSupported = localStorageService.isSupported;

          var requestOpts = {};

          if (isAuthorized && !localStorageService.get('isRedirect')) {
            console.log('isAuthorized');
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

                    $scope.formattedAddress = results[1].formatted_address;
                    if (!$scope.formattedAddress) {
                      $scope.formattedAddress = results[0].formatted_address;
                    }
                    var arr = angular.copy($scope.formattedAddress.split(','));
                    $scope.lineOne = arr[0];
                    arr.shift();
                    arr = arr.join(',');
                    $scope.lineTwo = arr;
                    $scope.streetNumber = results[0].address_components.short_name;
                    $scope.streetName = results[1].address_components.short_name;
                    $scope.city = angular.copy(results[0].formatted_address).split(',')[1];
                    console.log('city', $scope.city);
                    $scope.state = angular.copy($scope.formattedAddress).split(',')[2];
                    $scope.zipcode = angular.copy($scope.formattedAddress).split(',')[3];
                    localStorageService.set('streetNumber', $scope.streetNumber);
                    localStorageService.set('streetName', $scope.streetName);
                    localStorageService.set('city', $scope.city);
                    localStorageService.set('state', $scope.state);
                    localStorageService.set('zipcode', $scope.zipcode);
                    localStorageService.set('address', $scope.address);
                    $scope.encodedPickUp = encodeURIComponent(results[0].formatted_address);
                    localStorageService.set('encodedPickUp', $scope.encodedPickUp);
                    localStorageService.set('formattedAddress', $scope.formattedAddress);
                    console.log(localStorageService.get('formattedAddress'));
                    console.log('in ngNavigator.js init');
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
                obj.lat = obj.location.coordinate.latitude;
                obj.lon = obj.location.coordinate.longitude;
                if (!obj.image_url || obj.image_url === '') {
                  obj.image_url = "http://bigpurplebutton.com/sites/default/files/default_images/397_resized_700_700_90_516407cbbe17d_placeholder.jpg";
                }
              });
              $scope.results = results;
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
              console.log('onComplete')
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

angular.module('YouAreHere')
  .directive('ngSearch', function() {


    var directive = {
      restrict: 'A',
      scope: {
        searchTerm: '=',
        onSearch: '=',
        formattedAddress: '=',
        addressLineOne: '=',
        addressLineTwo: '=',
        isResults: '=',
        showSearchLoader: '=',
        city: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown keypress', function($event) {
          var isEnterBtn = ($event.which === 13);
          if (isEnterBtn) {
            scope.$parent.onSearch();
          }
        });
      },
      controller: ['$scope', '$rootScope', '$timeout', '$window', '$state', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $timeout, $window, $state, RequestApi, localStorageService) {

          console.log('### ngSearch.js');

          $scope.init = function() {
            if (!isAuthorized || !localStorageService.get('isAuthorized') || localStorageService.get('isRedirect')) {
              var isRequesting = $rootScope.isRequesting;
              if (isRequesting) {
                isReady();
              } else {
                onReady();
              }

              function isReady() {
                var isRequesting = $rootScope.isRequesting;
                if (isRequesting) {
                  $timeout(isReady, 200);
                } else {
                  $rootScope.isLogout = null;
                  onReady();
                }
              }

              function onReady() {
                localStorageService.clearAll();
                isAuthorized = null;
                localStorageService.set('isRedirect', true);
                RequestApi.onLogout().then(function() {
                  window.location.href = window.location.protocol + '//' + window.location.host;
                })
              }
            } else {
              $timeout(function() {
                angular.element(document.getElementById('search'))[0].focus();
              }, 100);
              $scope.formattedAddress = localStorageService.get('formattedAddress');
              var lineOne = angular.copy($scope.formattedAddress).split(',')[0];
              var lineTwo = angular.copy($scope.formattedAddress).split(',');
              lineTwo.shift()
              lineTwo = lineTwo.join(',')
              $scope.addressLineOne = lineOne;
              $scope.addressLineTwo = lineTwo;
              $scope.isAuthorized = localStorageService.get('isAuthorized');
              $scope.city = localStorageService.get('city');
            }
          }

          $scope.isResults = function() {
            return $state.current.name === 'results';
          };

          $scope.onSearch = function(isLogin) {
            if (!$scope.isAuthorized) {
              localStorageService.clearAll();
              $state.go('landing');
              return;
            }
            if ($scope.searchTerm) {
              if ($scope.isSearching) return;
              var requestOpts = {};
              $scope.isSearching = true;
              $scope.showSearchLoader = true;
              RequestApi.searchYelp($scope.searchTerm, $scope.city).then(function(response) {
                localStorageService.set('results', response.data);
                $state.go('results');
                $timeout(function() {
                  $scope.showSearchLoader = false;
                  $scope.isSearching = false;
                }, 200);
              }, function(err) {
                console.log(err);
              });
            } else {
              console.log('bad submit', $scope);
            }
          };
          $scope.init();
        }
      ],
    }
    return directive;
  });

angular.module('YouAreHere')
  .service('RequestApi', function($http) {

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
