/**
 * Main Config
 */

'use strict';

var env = {};
var path = require('path');
var uuid = require('node-uuid');

if (process.env.NODE_ENV !== 'production') {
  env = require('../../env.json')
}

module.exports = {
  server: {
    port: process.env.PORT || 3000
  },
  session: {
    secret: uuid.v4(),
    storeUri: process.env.MONGOLAB_URI || env.session.storeUri
  },
  root: path.normalize(__dirname + '../../../'),
  uber: {
    name: process.env.UBER_NAME || env.uber.name,
    clientId: process.env.UBER_CLIENT_ID || env.uber.clientId,
    clientSecret: process.env.UBER_CLIENT_SECRET || env.uber.clientSecret,
    serverToken: process.env.UBER_SERVER_TOKEN || env.uber.serverToken,
    callbackUrl: process.env.UBER_CALLBACK_URL || env.uber.callbackUrl
  },
  yelp: {
    consumerKey: process.env.YELP_CONSUMER_KEY || env.yelp.consumerKey,
    consumerSecret: process.env.YELP_CONSUMER_SECRET || env.yelp.consumerSecret,
    token: process.env.YELP_TOKEN || env.yelp.token,
    tokenSecret: process.env.YELP_TOKEN_SECRET || env.yelp.tokenSecret
  }
};
