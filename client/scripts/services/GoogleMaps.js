angular.module('PickAndRide')
  .service('GoogleMaps', function() {

    'use strict'

    function addEventListener(type, cb) {
      var autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('autocomplete')), {
          types: ['(cities)'],
          componentRestrictions: {
            country: 'us'
          }
        });
      google.maps.event.addListener(autocomplete, 'place_changed', function(e) {
        window.scrollTo(0, 0);
        cb();
      });
      return autocomplete;
    }

    function generateLocation(location, cb) {
      if (!location.formatted_address) return cb('bad location');
        location = location.formatted_address.split(',');
      if (location && location.length) {
        var city = location.slice(0, 1)[0];
        var state = location.slice(1, 2)[0];
        return cb(null, city, state);
      } else {
        return cb('bad location');
      }
    }

    return ({
      addEventListener: addEventListener,
      generateLocation: generateLocation
    });
  });
