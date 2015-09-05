angular.module('SearchPickGo')
  .directive('ngAutoComplete', function($state, GoogleMaps, RequestApi, StateService) {

    'use strict';

    var directive = {
      restrict: 'A',
      scope: {
        requestOpts: '=',
        onSubmit: '='
      },
      link: function(scope, element, attrs) {
        element.bind('keydown', function($event) {
          var isEnterBtn = ($event.which === 13);
          if (isEnterBtn) {
            scope.$parent.onSubmit();
          }
        });
      },
      controller: ['$scope', function($scope) {

        RequestApi.authorize();

        $scope.requestOpts = {};

        $scope.onAutoComplete = function() {
          GoogleMaps.generateLocation($scope.autoComplete.getPlace(), function(err, city, state) {
            $scope.requestOpts.city = city;
            $scope.requestOpts.state = state;
          });
        };

        $scope.onSubmit = function() {
          if ($scope.requestOpts.term && $scope.requestOpts.city && $scope.requestOpts.state) {
            RequestApi.searchYelp($scope.requestOpts).then(function(response) {
              StateService.data['results'] = response.data;
              $state.go('results');
            }, function(err) {
              console.log(err);
            });
          } else {
            console.log('bad submit', $scope.requestOpts);
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
