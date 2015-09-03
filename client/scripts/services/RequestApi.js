angular.module('PickAndRide')
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

    function successHandler(response) {
      return (response);
    }

    function errorHandler(response) {
      return (response);
    }

    return ({
      searchYelp: searchYelp
    });
    RequestApi.$inject('http');
  });
