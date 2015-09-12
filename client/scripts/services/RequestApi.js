angular.module('YouAreHere')
  .service('RequestApi', function($http) {

    'use strict'

    function searchYelp(term, city) {
      var request = $http({
        method: 'GET',
        url: '/search-yelp/' + term + '/' + city
      });
      return (request.then(successHandler, errorHandler));
    }

    function onLogin(startLat, startLon) {
      window.location.href = "http://localhost:3000/login/" + startLat + "/" + startLon;
    }

    function onLogout() {
      var request = $http({
        method: 'GET',
        url: '/logout'
      });
      return (request.then(successHandler, errorHandler));
    }

    function getEstimate(params) {
      var request = $http({
        method: 'POST',
        url: '/estimate',
        data: params
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

    function updateRideStatus(requestId, status) {
      var request = $http({
        method: 'GET',
        url: '/update-ride-status/' + requestId + '/' + status
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
      onLogin: onLogin,
      onLogout: onLogout,
      searchYelp: searchYelp,
      getEstimate: getEstimate,
      cancelRide: cancelRide,
      getRideStatus: getRideStatus,
      updateRideStatus: updateRideStatus
    });
    RequestApi.$inject('http');
  });
