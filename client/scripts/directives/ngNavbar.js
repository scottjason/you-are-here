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
