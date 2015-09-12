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
            var results = localStorageService.get('results').businesses;
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
            $scope.city = localStorageService.get('city');
            $scope.products = localStorageService.get('products');
            $scope.formattedAddress = localStorageService.get('formattedAddress');
            $scope.getEstimate($scope.results);
          });

          $scope.getEstimate = function(arr) {

            async.eachLimit(arr, 2, makeRequest, onComplete);

            function makeRequest(obj, cb) {
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
                });
                cb(null);
              }, function(err) {
                console.log(err);
              })
            }

            function onComplete() {
              console.log('complete');
            }
          };

          $scope.requestUber = function(endLat, endLon) {

            var isiPad = navigator.userAgent.match(/iPad/i) != null;
            var isiPhone = !isiPad && ((navigator.userAgent.match(/iPhone/i) != null) || (navigator.userAgent.match(/iPod/i) != null));
            var isiOS = isiPad || isiPhone;

            var deepLink = 'uber://?action=setPickup&pickup=my_location&client_id=' + $scope.clientId + '&dropoff[latitude]=' + endLat + '&dropoff[longitude]=' + endLon;
            var appStoreUrl = 'https://itunes.apple.com/us/app/uber/id368677368';

            if (isiOS) {
              window.location = deepLink;
              setTimeout(function() {
                window.location = appStoreUrl;
              }, 25);
            } else {
              console.log('not isiOS', endLat, endLon);
            }
          }
        }
      ],
    }
    return directive;
  });
