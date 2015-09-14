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
