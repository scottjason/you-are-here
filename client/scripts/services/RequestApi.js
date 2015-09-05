angular.module('SearchPickGo')
  .service('RequestApi', function($http) {

    'use strict'

    function searchYelp(params) {
      var request = $http({
        method: 'POST',
        url: '/search-yelp',
        data: params
      });
      return (request.then(successHandler, errorHandler));
    }

    function authorize(params) {
      window.location.href = "https://localhost:3000/authorize/";
      // console.log('making request');
      // var request = $http({
      //   method: 'GET',
      //   url: '/authorize'
      // });
      // return (request.then(successHandler, errorHandler));
    }

    function successHandler(response) {
      return (response);
    }

    function errorHandler(response) {
      return (response);
    }

    return ({
      searchYelp: searchYelp,
      authorize: authorize
    });
    RequestApi.$inject('http');
  });
