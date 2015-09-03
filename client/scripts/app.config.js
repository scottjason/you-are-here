'use strict';

angular.module('SearchPickGo')
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {

    $stateProvider
      .state('landing', {
        url: '/',
        templateUrl: 'views/landing.html',
        controller: 'LandingCtrl'
      })

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
  });