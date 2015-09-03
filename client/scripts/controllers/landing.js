'use strict';

angular.module('PickAndRide')
  .controller('LandingCtrl', LandingCtrl);

function LandingCtrl($scope, $rootScope, $state, $timeout, $window, GoogleMaps) {



  LandingCtrl.$inject['$scope', '$rootScope', '$state', '$timeout', '$window', 'GoogleMaps'];
}
