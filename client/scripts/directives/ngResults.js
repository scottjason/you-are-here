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
        showStatus: '='
      },
      link: function(scope, element, attrs) {},
      controller: ['$scope', '$timeout', 'RequestApi', 'localStorageService',
        function($scope, $timeout, RequestApi, localStorageService) {

          console.log('### ngResults.js')

          $timeout(function() {
            var results = localStorageService.get('results').businesses;
            results.forEach(function(obj) {
              if (obj.snippet_text && obj.snippet_text.length > 130) {
                obj.snippet_text = (obj.snippet_text).slice(0, 130) + ' ...';
              }
              if (obj.name && obj.name.length > 31) {
                obj.name = (obj.name).slice(0, 28) + '...';
              }
              obj.lat = obj.location.coordinate.latitude;
              obj.lon = obj.location.coordinate.longitude;
            });
            $scope.results = results;
            console.log('results', results);
          });
          // driver: null
          // eta: 9
          // location: null
          // request_id: "ae179c26-5f97-4eb0-8db5-f2b2149bd1cf"
          // status: "processing"
          // surge_multiplier: 1
          // vehicle: null

          // processing  The Request is matching to the most efficient available driver.
          // accepted  The Request has been accepted by a driver and is "en route" to the start location (i.e. start_latitude and start_longitude).
          // arriving  The driver has arrived or will be shortly.
          // in_progress The Request is "en route" from the start location to the end location.
          // driver_canceled The Request has been canceled by the driver.
          // completed Request has been completed by the driver.
          $scope.onRequestUber = function(endLat, endLon) {
            $scope.showStatus = true;
            $scope.endLat = endLat;
            $scope.endLon = endLon;
            RequestApi.requestRide(endLat, endLon).then(function(response) {
              $timeout(function() {
                $scope.ride = response.data;
              });
              console.log('response', response);
              $timeout(function() {
                getRideStatus();
              }, 3500);
              $timeout(function() {
                updateRideStatus();
              }, 3500);
            }, function(err) {
              console.log('err', err);
            });
          };

          $scope.onCancelUber = function() {
            RequestApi.cancelRide($scope.ride.request_id).then(function(response) {
              console.log('response', response);
              $timeout(function() {
                $scope.ride = response.data;
              });
            }, function(err) {
              console.err('ride status', err);
            });
          };

          function updateRideStatus() {
            RequestApi.updateRideStatus($scope.ride.request_id).then(function(response) {
              console.log('response', response);
              $timeout(function() {
                $scope.ride = response.data;
              });
            }, function(err) {
              console.err('ride status', err);
            });
          }

          function getRideStatus() {
            RequestApi.getRideStatus($scope.ride.request_id).then(function(response) {
              console.log('response', response);
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
