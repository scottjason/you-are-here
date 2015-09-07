angular.module('SearchPickGo')
  .directive('ngNavbar', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {

      },
      link: function(scope, element, attrs) {},
      templateUrl: 'views/navbar.html',
      controller: ['$scope', '$timeout', 'localStorageService',
        function($scope, $timeout, localStorageService) {

          console.log('### ngNavbar.js')

          $timeout(function() {
            $scope.firstName = localStorageService.get('firstName');
          });
        }
      ],
    }
    return directive;
  });
