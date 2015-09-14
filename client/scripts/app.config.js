'use strict';

angular.module('YouAreHere')
  .config(function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider, localStorageServiceProvider) {

    var isProduction = ((window.location.origin.indexOf('localhost:3000') === -1));
    if (isProduction) {
      // window.console.log = function() {
      //   return false;
      // };
    }

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
      .setNotify(true, true);

    $urlRouterProvider.otherwise('/');
    $locationProvider.html5Mode(true);
  });
