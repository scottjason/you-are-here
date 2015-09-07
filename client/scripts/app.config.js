'use strict';

angular.module('SearchPickGo')
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, localStorageServiceProvider) {

    $stateProvider
      .state('landing', {
        url: '/',
        templateUrl: 'views/landing.html'
      })
      .state('search', {
        url: '/search',
        templateUrl: 'views/search.html'
      })
      .state('results', {
        url: '/results',
        templateUrl: 'views/results.html'
      })

    localStorageServiceProvider
      .setPrefix('SearchPickGo')
      .setNotify(true, true);

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  });
