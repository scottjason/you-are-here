angular.module('SearchPickGo')
  .directive('ngAutoComplete', function($state, GoogleMaps, RequestApi, StateService) {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        requestOpts: '=',
        onSubmit: '=',
        isAuthorized: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {
          var isEnterBtn = ($event.which === 13);
          if (isEnterBtn) {
            scope.$parent.onSubmit();
          }
        });
      },
      controller: ['$scope', '$rootScope', '$timeout', function($scope, $rootScope, $timeout) {

        $timeout(function() {
          $scope.isAuthorized = isAuthorized;
          $scope.firstName = firstName;
          console.log('Access Token', accessToken);
          console.log('Refresh Token', refreshToken);
          console.log('First Name', firstName);
        }, 300);


        $scope.requestOpts = {};

        $scope.onAutoComplete = function() {
          GoogleMaps.generateLocation($scope.autoComplete.getPlace(), function(err, city, state) {
            $scope.requestOpts.city = city;
            $scope.requestOpts.state = state;
          });
        };

        $scope.onSubmit = function(isLogin) {
          if (!isLogin) {
            if ($scope.requestOpts.term && $scope.requestOpts.city && $scope.requestOpts.state) {
              console.log($scope.requestOpts)
              RequestApi.searchYelp($scope.requestOpts).then(function(response) {
                StateService.data['results'] = response.data;
                console.log(response.data)
                $state.go('results');
              }, function(err) {
                console.log(err);
              });
            } else {
              console.log('bad submit', $scope.requestOpts);
            }
          } else {
            RequestApi.authorize();
          }
        };

        function init() {
          $scope.autoComplete = GoogleMaps.addEventListener('autocomplete', $scope.onAutoComplete);
        }
        init();
      }],
    }
    return directive;
    ngAutoComplete.$inject('$state', 'GoogleMaps', 'RequestApi', 'StateService');
  });
