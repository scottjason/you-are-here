angular.module('SearchPickGo')
  .service('RequestApi', function($http, $window) {

    'use strict'

    function searchYelp(term, city) {
      var request = $http({
        method: 'GET',
        url: '/search-yelp/' + term + '/' + city
      });
      return (request.then(successHandler, errorHandler));
    }

    function login(startLat, startLon) {
      window.location.href = "http://localhost:3000/login/" + startLat + "/" + startLon;
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
      login: login,
      getProductId: getProductId
    });
    RequestApi.$inject('http', $window);
  });
