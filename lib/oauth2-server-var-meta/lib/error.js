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

var util = require('util');

module.exports = OAuth2Error;

/**
 * Error
 *
 * @param {String} error       Error descripton
 * @param {String} description Full error description
 * @param err
 * @param error_code
 */
function OAuth2Error (error, description, err, error_code, dynamic_data) {
  if (!(this instanceof OAuth2Error))
    return new OAuth2Error(error, description, err, error_code, dynamic_data);

  Error.call(this);

  this.name = this.constructor.name;
  if (err instanceof Error) {
    this.message = err.message;
    this.stack = err.stack;
  } else {
    this.message = description;
    this.error_code =  error_code;
    this.dynamic_data = dynamic_data ? dynamic_data : undefined;
    Error.captureStackTrace(this, this.constructor);
  }

  this.headers = {
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache'
  };

  switch (error) {
    case 'invalid_client':
      this.headers['WWW-Authenticate'] = 'Basic realm="Service"';
      /* falls through */
    case 'invalid_grant':
    case 'invalid_request':
      this.code = 400;
      break;
    case 'invalid_token':
      this.code = 401;
      break;
    case 'jwt expired':
      this.code = 401;
      break;
    case 'server_error':
      this.code = 503;
      if (!this.error_code)
        this.error_code = 'ERROR_SSO';
      break;
    default:
      this.code = 500;
      if (!this.error_code)
        this.error_code = 'ERROR_SSO';
  }

  // this.error = error;
  this.error = description || error;
  this.success = false;
}

util.inherits(OAuth2Error, Error);
