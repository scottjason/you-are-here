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
            }
          }

          $scope.onSearch = function(isLogin) {
            if (!$scope.accessToken || !$scope.startLat || !$scope.startLon) {
              localStorageService.clearAll();
              $state.go('landing');
              return;
            }
            if ($scope.searchTerm) {
              var requestOpts = {};
              requestOpts.searchTerm = $scope.searchTerm;
              requestOpts.startLat = $scope.startLat;
              requestOpts.startLon = $scope.startLon;
              console.log('isValid', requestOpts);
              return;
              RequestApi.searchYelp(requestOpts).then(function(response) {
                StateService.data['results'] = response.data;
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
