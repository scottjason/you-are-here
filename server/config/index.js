/**
 * Main Config
 */

'use strict';

var env = {};
var path = require('path');

if (process.env.NODE_ENV !== 'production') {
  env = require('../../env.json')
}

module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  root: path.normalize(__dirname + '../../../'),
  uber: {
    clientId: process.env.UBER_CLIENT_ID || env.uber.clientId,
    clientSecret: process.env.UBER_CLIENT_SECRET || env.uber.clientSecret,
    serverToken: process.env.UBER_SERVER_TOKEN || env.uber.serverToken
  },
  yelp: {
    consumerKey: process.env.YELP_CONSUMER_KEY || env.yelp.consumerKey,
    consumerSecret: process.env.YELP_CONSUMER_SECRET || env.yelp.consumerSecret,
    token: process.env.YELP_CONSUMER_KEY || env.yelp.token,
    tokenSecret: process.env.YELP_TOKEN || env.yelp.tokenSecret
  }
};
