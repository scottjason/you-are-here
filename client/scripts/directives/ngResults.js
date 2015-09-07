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
