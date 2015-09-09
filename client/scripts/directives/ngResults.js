angular.module('SearchPickGo')
  .directive('ngResults', function() {

    'use strict';

    var directive = {
      scope: {
        results: '=',
        ride: '=',
        onRequestUber: '=',
        onCancelUber: '=',
        showLoader: '=',
        showStatus: '=',
        getState: '='
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
              if (obj.snippet_text && obj.snippet_text.length > 136) {
                obj.snippet_text = (obj.snippet_text).slice(0, 133) + '...';
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
            console.log('results', results);
          });

          $scope.onRequestUber = function(endLat, endLon) {
            console.log('requesting uber');
            $scope.showStatus = true;
            $scope.endLat = endLat;
            $scope.endLon = endLon;
            RequestApi.requestRide(endLat, endLon).then(function(response) {
              console.log('$$$ response', response.data)
              $timeout(function() {
                $scope.ride = response.data;
                localStorageService.set('ride', response.data);
                if ($scope.ride.status !== 'accepted') {
                  $timeout(function(){
                    updateRideStatus();
                  }, 4000);
                } else {
                  getRideStatus();
                }
              });
            }, function(err) {
              console.log('err', err);
            });
          };

          $scope.onCancelUber = function() {
            console.log('canceling uber');
            var requestId = localStorageService.get('ride').request_id;
            RequestApi.cancelRide(requestId).then(function(response) {
              console.log('response onCancelUber', response);
              $timeout(function() {
                $scope.ride = response.data;
              });
            }, function(err) {
              console.err('ride status', err);
            });
          };

          function updateRideStatus() {
            console.log('updating ride status');
            var requestId = localStorageService.get('ride').request_id;
            RequestApi.updateRideStatus(requestId).then(function(response) {
              console.log('response updateRideStatus', response);
              $timeout(function() {
                $scope.ride = response.data;
                console.log('response', response.data);
                // getRideStatus();
              });
            }, function(err) {
              console.err('ride status', err);
            });
          }

          function getRideStatus() {
            console.log('getting ride status');
            var requestId = localStorageService.get('ride').request_id;
            RequestApi.getRideStatus(requestId).then(function(response) {
              console.log("### GOT RIDE STATUS", response.data);
              $timeout(function() {
                $scope.ride = response.data;
              });
              $timeout(getRideStatus, 3500);

            }, function(err) {
              console.err('ride status', err);
            });
          }
        }
      ],
    }
    return directive;
  });
