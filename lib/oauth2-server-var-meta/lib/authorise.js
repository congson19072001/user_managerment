/**
 * Copyright 2013-present NightWorld.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var error = require('./error'),
  runner = require('./runner');
const { messages, error_codes } = require('../../../helpers/constants')

module.exports = Authorise;

/**
 * This is the function order used by the runner
 *
 * @type {Array}
 */
var fns = [
  getBearerToken,
  checkToken
];

/**
 * Authorise
 *
 * @param {Object}   config Instance of OAuth object
 * @param {Object}   req
 * @param {Object}   res
 * @param {Function} next
 */
function Authorise (config, req, next) {
  this.config = config;
  this.model = config.model;
  this.req = req;

  runner(fns, this, next);
}

/**
 * Get bearer token
 *
 * Extract token from request according to RFC6750
 *
 * @param  {Function} done
 * @this   OAuth
 */
function getBearerToken (done) {
  var headerToken = this.req.get('Authorization'),
    getToken =  this.req.query.access_token,
    postToken = this.req.body ? this.req.body.access_token : undefined;

  // Check exactly one method was used
  var methodsUsed = (headerToken !== undefined) + (getToken !== undefined) +
    (postToken !== undefined);

  if (methodsUsed > 1) {
    return done(error('invalid_request',
      messages.ONLY_ONE_METHOD_MUST_BE_AUTHENTICATE_AT_A_TIME, undefined, error_codes.ONLY_ONE_METHOD_MUST_BE_AUTHENTICATE_AT_A_TIME));
  } else if (methodsUsed === 0) {
    return done(error('invalid_request', messages.ACCESS_TOKEN_NOT_FOUND, undefined, error_codes.ACCESS_TOKEN_NOT_FOUND));
  }

  // Header: http://tools.ietf.org/html/rfc6750#section-2.1
  if (headerToken) {
    var matches = headerToken.match(/Bearer\s(\S+)/);

    if (!matches) {
      return done(error('invalid_request', messages.MALFORMED_AUTH_HEADER, undefined, error_codes.MALFORMED_AUTH_HEADER));
    }

    headerToken = matches[1];
  }

  // POST: http://tools.ietf.org/html/rfc6750#section-2.2
  if (postToken) {
    if (this.req.method === 'GET') {
      return done(error('invalid_request',
        messages.METHOD_CANNOT_GET, undefined, error_codes.METHOD_CANNOT_GET));
    }

    // if (!this.req.is('application/x-www-form-urlencoded')) {
    //   return done(error('invalid_request', 'When putting the token in the ' +
    //     'body, content type must be application/x-www-form-urlencoded.'));
    // }
  }

  this.bearerToken = headerToken || postToken || getToken;
  done();
}

/**
 * Check token
 *
 * Check it against model, ensure it's not expired
 * @param  {Function} done
 * @this   OAuth
 */
function checkToken (done) {
  var self = this;
  this.model.getAccessToken(this.bearerToken, function (err, data) {

    if (err?.message == 'jwt expired') {
      return done(error('jwt expired', messages.ACCESS_TOKEN_EXPIRED, err, error_codes.ACCESS_TOKEN_EXPIRED));
    } else if (err) return done(error('server_error', false, err));

    if (!data || !global.jwtToken[data.clientId+data.userId+data.type+data.token]) {
      return done(error('invalid_token',
        messages.ACCESS_TOKEN_INVALID, undefined, error_codes.ACCESS_TOKEN_INVALID));
    }

    if (data.expires !== null &&
      (!data.expires || data.expires < new Date())) {
      return done(error('invalid_token',
          messages.ACCESS_TOKEN_EXPIRED, undefined, error_codes.ACCESS_TOKEN_EXPIRED));
    }

    // Expose params
    self.req.oauth = { bearerToken: data };
    self.req.user = data.user ? data.user : { id: data.userId };

    done();
  });
}
