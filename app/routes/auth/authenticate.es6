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

const _ = require('lodash');
const log = require('../../resources/fluentd.es6');
const request = require('request');
const resources = require('../../resources/strings.es6');
const server = require('../../../server.es6');
const mocks = require('./authenticate_mocks.es6');

const AUTH_METHODS = {
  BASIC_AUTH: 'basic_auth',
  IDM_AUTH: 'idm_auth'
};

const SUPPORTED_VERBS = {
  GET: 'GET',
  PUT: 'PUT',
  POST: 'POST'
};

const VALID_AUTH_RETURN_CODES = [
  200,
  201,
  202,
  203,
  204,
  205,
  206,
  207,
  208,
  226
];

class Auth {
  constructor(authConfig, secrets) {
    this.authConfig = authConfig;
    this.secrets = secrets;

    // Subclasses must implement their own authentication method based on auth type
    if (this.authenticate === undefined) {
      throw new TypeError("Must override method `authenticate`");
    }

    // Subclasses must implement a method which returns a list of expected SUCCESS status codes
    if (this.constructor.getSuccessCodes === undefined) {
      throw new TypeError("Must override method `getSuccessCodes`");
    }

    // Subclasses must implement a method which returns a list of valid request VERBS
    if (this.constructor.getValidVerbs === undefined) {
      throw new TypeError("Must override method `getValidVerbs`");
    }
  }

  // TODO: Boot mock server and redirect to random, unused endpoint
  // TODO: This code introduces co-dependencies between application and test code. Refactor!
  redirect(options, cb) {
    if (this.constructor.name === "BasicAuth") {
      /* start basic auth server on 3001 */
      /* no mock for basic auth yet, leaving empty */
      cb(options);
    } else if (this.constructor.name === "IdmAuth") {
      /* start idm auth server on 3002 */
      mocks.IdmMockServer.run(
        resources.MOCK_IDM_CREDS.username,
        resources.MOCK_IDM_CREDS.password,
        resources.MOCK_IDM_CREDS.tenantName,
        resources.MOCK_IDM_CREDS.tenantUsername,
        resources.MOCK_IDM_CREDS.tenantPassword,
        port => {
          let redirected = _.assign(options, {url: `http://localhost:${port}/`});
          cb(redirected);
        });
    } else {
      log.error(new Error(`There's no class named ${this.constructor.name} to mock.`));
    }
  }

  // Redirect request to mocks.
  request(options, callback) {
    if (server.app.get('mock_auth') === true) {
      /* redirect to mock */
      this.redirect(options, redirected => {
        request(
          redirected,
          callback
        );
      });
    } else {
      request(
        options,
        callback
      );
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
  // Returns an array that contains the expected http status codes upon success
  static getSuccessCodes() {
    return VALID_AUTH_RETURN_CODES;
  }
  // Return an array of the verbs which the auth endpoint accepts
  static getValidVerbs() {
    return [
      SUPPORTED_VERBS.GET,
      SUPPORTED_VERBS.PUT,
      SUPPORTED_VERBS.POST
    ];
  }
  // Returns success or failure
  // cb( error, response )
  //   where response MUST have a response.secrets.token
  authenticate(cb) {
    let response = {};

    if (_.isNil(this.authConfig)) {
      log.error(resources.INTEGRATION_AUTH_PARAMS_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_PARAMS_MISSING), null);
    }

    // If no endpoint is given, authenticate successfully
    if (
      !_.has(this.authConfig, 'params.endpoint') ||
      _.isNil(this.authConfig.params.endpoint)
      ) {
      log.info(resources.INTEGRATION_AUTH_SKIPPING_AUTHENTICATION);
      log.debug(this.authConfig.params);
      return cb(null, this.formatResponse(response));
    }

    if (_.isNil(this.authConfig.params.endpoint.url)) {
      log.error(resources.INTEGRATION_AUTH_URL_MISSING);
      log.debug(this.authConfig.params.endpoint);
      return cb(new Error(resources.INTEGRATION_AUTH_URL_MISSING), null);
    }

    if (_.isNil(this.authConfig.params.endpoint.verb)) {
      log.error(resources.INTEGRATION_AUTH_VERB_MISSING);
      log.debug(this.authConfig.params.endpoint);
      return cb(new Error(resources.INTEGRATION_AUTH_VERB_MISSING), null);
    }

    if (!_.includes(this.constructor.getValidVerbs(), this.authConfig.params.endpoint.verb)) {
      log.error(resources.INTEGRATION_AUTH_VERB_NOT_SUPPORTED);
      log.debug(`No support for verb ${this.authConfig.params.endpoint.verb}`);
      log.debug(`Supported verbs ${this.constructor.getValidVerbs()}`);
      return cb(new Error(resources.INTEGRATION_AUTH_VERB_NOT_SUPPORTED), null);
    }

    if (_.isNil(this.secrets)) {
      log.error(resources.INTEGRATION_AUTH_SECRETS_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_SECRETS_MISSING), null);
    }

    if (_.isNil(this.secrets.username)) {
      log.error(resources.INTEGRATION_AUTH_USERNAME_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_USERNAME_MISSING), null);
    }

    if (
      !_.has(this.secrets, 'password') ||
      this.secrets.password === undefined
      ) {
      log.error(resources.INTEGRATION_AUTH_PASSWORD_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_PASSWORD_MISSING), null);
    }

    const username = this.secrets.username;
    const password = this.secrets.password;
    const endpoint = this.authConfig.params.endpoint.url;
    const verb = this.authConfig.params.endpoint.verb;

    const base64Secrets = new Buffer(username + ":" + password).toString("base64");
    const auth = "Basic " + base64Secrets;

    this.request(
      {
        url: endpoint,
        method: verb,
        headers: {
          Authorization: auth
        }
      },
      (error, response, body) => {
        if (error) {
          log.error(`Error while authenticating against ${endpoint}.`);
          return cb(error, null);
        }

        log.debug(`Error object ${error}`);
        log.debug(`Response object ${response}`);
        log.debug(`Body object ${body}`);

        if (response && _.includes(this.constructor.getSuccessCodes(), response.statusCode)) {
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
  // Returns an array that contains the expected http status codes upon success
  static getSuccessCodes() {
    return [
      200
    ];
  }
  // Return an array of the verbs which the auth endpoint accepts
  static getValidVerbs() {
    return [
      SUPPORTED_VERBS.POST
    ];
  }
  // Returns success or failure
  // cb( error, response )
  //   where response MUST have a response.secrets.token
  authenticate(cb) {
    if (!this.authConfig || !this.authConfig.params) {
      log.error(resources.INTEGRATION_AUTH_PARAMS_MISSING);
      log.debug(this.authConfig);
      return cb(new Error(resources.INTEGRATION_AUTH_PARAMS_MISSING), null);
    }

    if (!this.authConfig.params.endpoint) {
      log.error(resources.INTEGRATION_AUTH_ENDPOINT_MISSING);
      log.debug(this.authConfig.params);
      return cb(new Error(resources.INTEGRATION_AUTH_ENDPOINT_MISSING), null);
    }

    if (!this.authConfig.params.endpoint.url) {
      log.error(resources.INTEGRATION_AUTH_URL_MISSING);
      log.debug(this.authConfig.params.endpoint);
      return cb(new Error(resources.INTEGRATION_AUTH_URL_MISSING), null);
    }

    if (!this.authConfig.params.endpoint.verb) {
      log.error(resources.INTEGRATION_AUTH_VERB_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_VERB_MISSING), null);
    }

    if (!_.includes(this.constructor.getValidVerbs(), this.authConfig.params.endpoint.verb)) {
      log.error(resources.INTEGRATION_AUTH_VERB_NOT_SUPPORTED);
      log.debug(`No support for verb ${this.authConfig.params.endpoint.verb}`);
      log.debug(`Supported verbs ${this.constructor.getValidVerbs()}`);
      return cb(new Error(resources.INTEGRATION_AUTH_VERB_NOT_SUPPORTED), null);
    }

    if (!this.secrets) {
      log.error(resources.INTEGRATION_AUTH_SECRETS_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_SECRETS_MISSING), null);
    }

    if (!this.secrets.tenant) {
      log.error(resources.INTEGRATION_AUTH_TENANT_STRUCTURE_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_TENANT_STRUCTURE_MISSING), null);
    }

    if (!this.secrets.user) {
      log.error(resources.INTEGRATION_AUTH_USER_STRUCTURE_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_USER_STRUCTURE_MISSING), null);
    }

    if (!this.secrets.user.username) {
      log.error(resources.INTEGRATION_AUTH_USER_USERNAME_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_USER_USERNAME_MISSING), null);
    }

    if (!this.secrets.user.password) {
      log.error(resources.INTEGRATION_AUTH_USER_PASSWORD_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_USER_PASSWORD_MISSING), null);
    }

    if (!this.secrets.tenant.name) {
      log.error(resources.INTEGRATION_AUTH_TENANT_NAME_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_TENANT_NAME_MISSING), null);
    }

    if (!this.secrets.tenant.username) {
      log.error(resources.INTEGRATION_AUTH_TENANT_USERNAME_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_TENANT_USERNAME_MISSING), null);
    }

    if (!this.secrets.tenant.password) {
      log.error(resources.INTEGRATION_AUTH_TENANT_PASSWORD_MISSING);
      return cb(new Error(resources.INTEGRATION_AUTH_TENANT_PASSWORD_MISSING), null);
    }

    const url = this.authConfig.params.endpoint.url;
    const verb = this.authConfig.params.endpoint.verb;
    const username = this.secrets.user.username;
    const password = this.secrets.user.password;
    const tenantName = this.secrets.tenant.name;
    const tenantUsername = this.secrets.tenant.username;
    const tenantPassword = this.secrets.tenant.password;

    const base64Secrets = new Buffer(tenantUsername + ":" + tenantPassword).toString("base64");
    const auth = "Basic " + base64Secrets;

    this.request(
      {
        url: url,
        method: verb,
        json: true,
        body: {
          passwordCredentials: {
            username: username,
            password: password
          },
          tenantName: tenantName
        },
        headers: {
          Authorization: auth
        }
      },
      (error, response, body) => {
        if (error) {
          log.error(`Error while authenticating against ${url}.`);
          return cb(error, null);
        }

        log.debug(`Error object ${error}`);
        log.debug(`Response object ${response}`);
        log.debug(`Body object ${body}`);

        if (response && _.includes(this.constructor.getSuccessCodes(), response.statusCode)) {
          if (
            !_.has(body, 'token') ||
            !_.has(body.token, 'id') ||
            !_.has(body, 'refreshToken')
            ) {
            log.error(body.token);
            return cb(new Error(resources.INTEGRATION_AUTH_UNEXPECTED_RESPONSE_FROM_AS), null);
          }

          // Successfully authenticated
          log.info(`Successfully authenticated against ${url}.`);
          log.debug(body);
          return cb(null, this.formatResponse(body));
        } else if (_.includes(VALID_AUTH_RETURN_CODES, response.statusCode)) {
          log.error(resources.INTEGRATION_AUTH_UNEXPECTED_STATUS_CODE_FROM_AS);
          return cb(new Error(resources.INTEGRATION_AUTH_UNEXPECTED_STATUS_CODE_FROM_AS), null);
        }

        return cb(null, null);
      }
    );
  }
}

function newAuth(authConfig, secrets) {
  switch (authConfig.type) {
    case AUTH_METHODS.BASIC_AUTH:
      return new BasicAuth(authConfig, secrets);
    case AUTH_METHODS.IDM_AUTH:
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
    return cb(new Error(resources.SCHEMA_REQUIREMENT_NOT_MET), null);
  }

  let auth = newAuth(authConfig, secrets);

  if (auth instanceof Auth) {
    log.info('authenticating...');
    auth.authenticate((err, success) => {
      return cb(err, success);
    });
  } else {
    log.error('Selected auth object is not of type Auth.');
    return cb(new Error(resources.SCHEMA_REQUIREMENT_NOT_MET), null);
  }
};

module.exports = {authenticateAgainst, AUTH_METHODS, SUPPORTED_VERBS, VALID_AUTH_RETURN_CODES};
