angular.module('SearchPickGo')
  .service('RequestApi', function($http) {

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

    function requestRide(endLat, endLon) {
      var request = $http({
        method: 'GET',
        url: '/request-ride/' + endLat.toString() + '/' + endLon.toString()
      });
      return (request.then(successHandler, errorHandler));
    }

    function cancelRide(requestId) {
      var request = $http({
        method: 'GET',
        url: '/cancel-ride/' + requestId
      });
      return (request.then(successHandler, errorHandler));
    }

    function getRideStatus(requestId) {
      var request = $http({
        method: 'GET',
        url: '/get-ride-status/' + requestId
      });
      return (request.then(successHandler, errorHandler));
    }

    function updateRideStatus(requestId) {
      var request = $http({
        method: 'GET',
        url: '/update-ride-status/' + requestId
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
      login: login,
      searchYelp: searchYelp,
      requestRide: requestRide,
      cancelRide: cancelRide,
      getRideStatus: getRideStatus,
      updateRideStatus: updateRideStatus
    });
    RequestApi.$inject('http');
  });
