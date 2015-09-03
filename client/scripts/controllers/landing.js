'use strict';

angular.module('SearchPickGo')
  .controller('LandingCtrl', LandingCtrl);

function LandingCtrl($scope, $rootScope, $state, $timeout, $window, GoogleMaps) {



  LandingCtrl.$inject['$scope', '$rootScope', '$state', '$timeout', '$window', 'GoogleMaps'];
}
