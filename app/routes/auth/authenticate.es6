// Copyright 2016 Hewlett-Packard Development Company, L.P.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// END OF TERMS AND CONDITIONS

const stringsResource = require('../../resources/strings.es6');
const _ = require('lodash');
const log = require('../../resources/fluentd.es6');
const request = require('request');

const authMethods = {
  BASIC_AUTH: 'basic_auth',
  IDM_AUTH: 'idm_auth'
};

const supportedVerbs = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST'
};

class Auth {
  constructor(authConfig, secrets) {
    this.authConfig = authConfig;
    this.secrets = secrets;

    // Subclasses must implement their own authentication method based on auth type
    if (this.authenticate === undefined) {
      throw new TypeError("Must override method `authenticate`");
    }
  }
}

class BasicAuth extends Auth {
  formatResponse(response) {
    const username = this.secrets.username;
    const password = this.secrets.password;
    const base64Secrets = new Buffer(username + ":" + password).toString("base64");
    // For basic auth, since there is no response, override it with the secrets obj.
    response = {
      token: base64Secrets
    };
    return response;
  }
  // Returns success or failure
  // cb( error, response )
  //   where response MUST have a response.secrets.token
  authenticate(cb) {
    let response = {};

    // If no endpoint is given, authenticate successfully
    if (!_.has(this.authConfig.params, 'endpoint')) {
      log.info('Endpoint missing from parameter list. Skipping authentication step.');
      return cb(null, this.formatResponse(response));
    }

    if (
      !_.has(this.authConfig.params.endpoint, 'url') ||
      !_.has(this.authConfig.params.endpoint, 'verb')
      ) {
      log.info('URL or VERB not provided.');
      return cb(new Error('URL or VERB not provided.'), null);
    }

    if (!_.includes(supportedVerbs, this.authConfig.params.endpoint.verb)) {
      log.info('VERB not supported.');
      return cb(new Error('VERB not supported.'), null);
    }

    if (!_.has(this.secrets, 'username')) {
      log.info('Endpoint found but a username was not provided.');
      return cb(new Error('Username not provided'), null);
    }

    if (!_.has(this.secrets, 'password')) {
      log.info('Endpoint found but a password was not provided.');
      return cb(new Error('Password not provided'), null);
    }

    const username = this.secrets.username;
    const password = this.secrets.password;
    const endpoint = this.authConfig.params.endpoint.url;
    const verb = this.authConfig.params.endpoint.verb;

    const base64Secrets = new Buffer(username + ":" + password).toString("base64");
    const auth = "Basic " + base64Secrets;

    request(
      {
        url: endpoint,
        method: verb,
        headers: {
          Authorization: auth
        }
      },
      (error, response, body) => {
        if (error) {
          log.info(`Error while authenticating against ${endpoint}.`);
          return cb(error, null);
        }

        if (response && response.statusCode >= 200 && response.statusCode <= 299) {
          // Successfully authenticated
          log.info(`Successfully authenticated against ${endpoint}.`);
          log.debug(body);
          return cb(null, this.formatResponse(response));
        }

        return cb(null, null);
      }
    );
  }
}

class IdmAuth extends Auth {
  formatResponse(response) {
    const token = response.token.id;
    const refreshToken = response.refreshToken;
    return {
      token,
      refreshToken
    };
  }
  // Returns success or failure
  // cb( error, response )
  //   where response MUST have a response.secrets.token
  authenticate(cb) {
    if (
      !_.has(this.authConfig.params, 'endpoint') ||
      !_.has(this.authConfig.params.endpoint, 'url') ||
      !_.has(this.authConfig.params.endpoint, 'verb')
      ) {
      log.info('ENDPOINT, URL or VERB not provided.');
      return cb(new Error('ENDPOINT, URL or VERB not provided.'), null);
    }

    if (!_.includes(supportedVerbs, this.authConfig.params.endpoint.verb)) {
      log.info('VERB not supported.');
      return cb(new Error('VERB not supported.'), null);
    }

    if (
      !_.has(this.secrets, 'user') ||
      !_.has(this.secrets, 'tenant')
      ) {
      log.info('Endpoint found but an USER or TENANT object was not provided.');
      return cb(new Error('USER/TENANT object was not provided'), null);
    }

    if (
      !_.has(this.secrets.user, 'username') ||
      !_.has(this.secrets.user, 'password')
      ) {
      log.info('Endpoint found but credentials are malformed in the USER object.');
      return cb(new Error('Credentials are malformed in the USER object'), null);
    }

    if (
      !_.has(this.secrets.tenant, 'username') ||
      !_.has(this.secrets.tenant, 'password')
      ) {
      log.info('Endpoint found but credentials are malformed in the TENANT object.');
      return cb(new Error('Credentials are malformed in the TENANT object'), null);
    }

    const url = this.authConfig.params.endpoint.url;
    const verb = this.authConfig.params.endpoint.verb;
    const username = this.secrets.user.username;
    const password = this.secrets.user.password;
    const tenantUsername = this.secrets.tenant.username;
    const tenantPassword = this.secrets.tenant.password;

    const base64Secrets = new Buffer(tenantUsername + ":" + tenantPassword).toString("base64");
    const auth = "Basic " + base64Secrets;

    request(
      {
        url: url,
        method: verb,
        json: true,
        body: {
          passwordCredentials: {
            username: username,
            password: password
          },
          tenantName: tenantUsername
        },
        headers: {
          Authorization: auth
        }
      },
      (error, response, body) => {
        if (error) {
          log.info(`Error while authenticating against ${url}.`);
          return cb(error, null);
        }

        if (response && response.statusCode >= 200 && response.statusCode <= 299) {
          // Successfully authenticated
          log.info(`Successfully authenticated against ${url}.`);
          log.debug(body);
          return cb(null, this.formatResponse(response));
        }

        return cb(new Error(`Authentication unsuccessful for ${url}.`), null);
      }
    );
  }
}

function newAuth(authConfig, secrets) {
  switch (authConfig.type) {
    case authMethods.BASIC_AUTH:
      return new BasicAuth(authConfig, secrets);
    case authMethods.IDM_AUTH:
      return new IdmAuth(authConfig, secrets);
    default:
      return null;
  }
}

let authenticateAgainst = (integration, user, authConfig, secrets, cb) => {
  if (!_.has(integration, 'name') || !_.has(user, 'id') ||
      !_.has(integration, 'auth') || !_.isObject(secrets) || !_.has(authConfig, 'type')
  ) {
    log.error('Authentication schema not met.');
    return cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET), null);
  }

  let auth = newAuth(authConfig, secrets);

  if (auth instanceof Auth) {
    log.info('authenticating...');
    auth.authenticate((err, success) => {
      return cb(err, success);
    });
  } else {
    log.error('Selected auth object is not of type Auth.');
    return cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET), null);
  }
};

module.exports = {authenticateAgainst, authMethods, supportedVerbs};
