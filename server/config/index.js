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
    clientId: env.uber.clientId,
    clientSecret: env.uber.clientSecret,
    serverToken: env.uber.serverToken
  },
  yelp: {
    consumerKey: env.yelp.consumerKey,
    consumerSecret: env.yelp.consumerSecret,
    token: env.yelp.token,
    tokenSecret: env.yelp.tokenSecret
  }
};
