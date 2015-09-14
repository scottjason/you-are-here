angular.module('YouAreHere')
  .directive('ngSearch', function() {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        searchTerm: '=',
        onSearch: '=',
        formattedAddress: '=',
        addressLineOne: '=',
        addressLineTwo: '=',
        isResults: '=',
        showLoader: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown keypress', function($event) {
          var isEnterBtn = ($event.which === 13);
          if (isEnterBtn) {
            scope.$parent.onSearch();
          }
        });
      },
      controller: ['$scope', '$rootScope', '$timeout', '$state', 'RequestApi', 'localStorageService',
        function($scope, $rootScope, $timeout, $state, RequestApi, localStorageService) {

          console.log('### ngSearch.js');

          $scope.init = function() {
            if (!isAuthorized) {
              localStorageService.clearAll();
              $state.go('landing');
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
              var requestOpts = {};
              $scope.showLoader = true;
              RequestApi.searchYelp($scope.searchTerm, $scope.city).then(function(response) {
                localStorageService.set('results', response.data);
                $state.go('results');
                $timeout(function() {
                  $scope.showLoader = true;
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
