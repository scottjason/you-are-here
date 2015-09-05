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
      window.location.href = "http://localhost:3000/authorize/";
    }

    function getProductId(params) {
      var request = $http({
        method: 'POST',
        url: '/product-id',
        params: params
      });
      return (request.then(successHandler, errorHandler));
    }

    function successHandler(response) {
      return (response);
    }

    function errorHandler(response) {
      return (response);
    }

    return ({
      searchYelp: searchYelp,
      authorize: authorize,
      getProductId: getProductId
    });
    RequestApi.$inject('http');
  });
