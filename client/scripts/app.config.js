'use strict';

angular.module('SearchPickGo')
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, localStorageServiceProvider) {

    $stateProvider
      .state('landing', {
        url: '/',
        templateUrl: 'views/landing.html'
      })
      .state('results', {
        url: '/results',
        templateUrl: 'views/layout.html'
      })

    localStorageServiceProvider
      .setPrefix('SearchPickGo')
      .setNotify(true, true);

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  });
