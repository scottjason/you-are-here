angular.module('SearchPickGo')
  .service('RequestApi', function($http) {

    'use strict'

    function searchYelp(params) {
      var request = $http({
        method: 'GET',
        url: '/search-yelp/' + params.term + '/' + params.city + '/' + params.state
      });
      return (request.then(successHandler, errorHandler));
    }

    function authorize(params) {
      window.location.href = "https://localhost:3000/authorize/";
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
