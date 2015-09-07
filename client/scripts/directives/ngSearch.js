angular.module('SearchPickGo')
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
      controller: ['$scope', '$rootScope', '$timeout', '$state', 'RequestApi', 'StateService', 'localStorageService',
        function($scope, $rootScope, $timeout, $state, RequestApi, StateService, localStorageService) {

          console.log('### ngSearch.js');

          init();

          function init() {
            if (isAuthorized !== 'true') {
              localStorageService.clearAll();
              $state.go('landing');
            } else {
              $scope.firstName = localStorageService.get('firstName');
              $scope.accessToken = localStorageService.get('accessToken');
              $scope.startLat = localStorageService.get('startLat');
              $scope.startLon = localStorageService.get('startLon');
              $scope.uberXId = localStorageService.get('uberXId');
              $scope.city = localStorageService.get('city');
              $scope.formattedAddress = localStorageService.get('formattedAddress');
            }
          }

          $scope.onSearch = function(isLogin) {
            if (!$scope.accessToken) {
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
