"use strict";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const request = require('request');
const _ = require('lodash');
const UNEXPECTED_STATUS_CODE = 'Unexpected status code == ';
const MALFORMED_RESPONSE = 'Response malformed ';
const MALFORMED_REQUEST = 'Request / opts malformed';
const EMPTY_PARAMETER = 'Empty parameter';

/* eslint-disable camelcase */

// TODO: add checks for callback _.isFunc()
class AuthServiceClient {

  constructor(config) {
    if (!config) {
      throw new Error('config for auth client is empty');
    }

    this.endpoint = config.endpoint;
    if (!this.configOk()) {
      throw new Error('auth client requires valid configuration,' +
        ' one or more parameters are missing.', config);
    }
    this.trimEndpoint();
    this.headers = {
      'Content-Type': 'application/json'
    };
    this.pathFormat = '/secrets/<user>/<integration>';

    if (config.selfSignedCerts) {
      console.log('Using self signed config');
    }
  }

  trimEndpoint() {
    let endpoint = _.trim(this.endpoint.toString());
    if (_.endsWith(endpoint, '/')) {
      endpoint = _.trimEnd(endpoint, '/');
    }
    this.endpoint = endpoint;
  }

  configOk() {
    return Boolean(this.endpoint) && this.endpoint !== '';
  }

  generateTokenUrl(opts, callback) {
    // send http request to the auth service to get the token url
    let path = "/token_urls";

    if (!AuthServiceClient.validTokenUrlRequest(opts)) {
      return callback(new Error(MALFORMED_REQUEST), opts);
    }

    let payload = {
      user_info: opts.userInfo,
      integration_info: opts.integrationInfo,
      bot_info: opts.botInfo,
      url_props: opts.urlProps
    };

    let options = {
      uri: this.endpoint + path,
      body: payload,
      json: true,
      headers: this.headers,
      method: 'POST'
    };

    request(options, (error, response, body) => {
      if (error) {
        return callback(error, body);
      }

      if (response.statusCode !== 201) {
        let statusCode = response.statusCode.toString();
        return callback(new Error(UNEXPECTED_STATUS_CODE + statusCode), body);
      }

      if (!AuthServiceClient.validTokenUrlResponse(body)) {
        return callback(new Error(MALFORMED_RESPONSE + 'token_url'), body);
      }

      callback(null, body);
    });
  }

  static validTokenUrlResponse(resp) {
    return resp instanceof Object &&
      Boolean(resp.token) &&
      Boolean(resp.message) &&
      Boolean(resp.url);
  }

  static validTokenUrlRequest(req) {
    return _.isObject(req) &&
      _.has(req, 'userInfo.id') &&
      _.has(req, 'integrationInfo.name') &&
      _.has(req, 'integrationInfo.auth') &&
      _.has(req, 'botInfo') &&
      _.has(req, 'urlProps.ttl') &&
      !_.includes(_.get(req, 'integrationInfo.name'), ' ') &&
      !_.includes(_.get(req, 'userInfo.id'), ' ') &&
      _.isString(_.get(req, 'userInfo.id'));
  }

  saveSecrets(opts, callback) {
    if (!_.isObject(opts) || _.isEmpty(opts))
      return callback(new Error(MALFORMED_REQUEST + 'secrets object'), null);

    if (!_.has(opts, 'token'))
      return callback(new Error(MALFORMED_REQUEST + ": token"), null);

    if (!_.has(opts, 'secrets'))
      return callback(new Error(MALFORMED_REQUEST + ": secrets"), null);

    // send http request to the auth service to get the token url
    let path = '/secrets';

    let payload = {
      uri: this.endpoint + path,
      body: opts,
      json: true,
      headers: this.headers,
      method: 'POST'
    };

    request(payload, (error, response, body) => {
      if (error) {
        return callback(error, body);
      }

      if (response.statusCode !== 201) {
        let statusCode = response.statusCode.toString();
        return callback(new Error(UNEXPECTED_STATUS_CODE + statusCode), body);
      }

      if (!AuthServiceClient.validSecretMessageResponse(body)) {
        return callback(new Error(MALFORMED_RESPONSE + 'secrets'), body);
      }

      callback(null, body);
    });
  }

  // Idiomatic wrapper for getSecrets()
  authenticated(user, integration, callback) {
    // send http request to verify if the user is authenticated
    this.getSecrets(user, integration, callback);
  }

  getSecretsPath(userName, integratioName) {
    return _.replace(this.pathFormat, '<user>', userName)
      .replace('<integration>', integratioName);
  }

  getSecrets(user, integration, callback) {
    if (_.isEmpty(user))
      return callback(new Error(EMPTY_PARAMETER + ': user'), null);
    if (_.isEmpty(integration))
      return callback(new Error(EMPTY_PARAMETER + ': integration'), null);

    // send http request to ask the auth server for the user secrets
    let path = this.getSecretsPath(user, integration);

    let opts = {
      uri: this.endpoint + path,
      json: true,
      headers: this.headers,
      method: 'GET'
    };

    request(opts, (error, response, body) => {
      if (error) {
        return callback(error, body);
      }

      if (response.statusCode !== 200) {
        let statusCode = response.statusCode.toString();
        return callback(new Error(UNEXPECTED_STATUS_CODE + statusCode), body);
      }

      if (!AuthServiceClient.validSecretsResponse(body)) {
        let err = new Error(MALFORMED_RESPONSE + 'secrets response');
        return callback(err, body);
      }

      callback(null, body);
    });
  }

  static validSecretMessageResponse(resp) {
    return _.isObject(resp) &&
      _.has(resp, 'message');
  }

  static validSecretsResponse(resp) {
    return _.isObject(resp) &&
      _.has(resp, 'secrets') &&
      _.has(resp, 'user_info.id') &&
      _.has(resp, 'integration_info.name');
  }
}

module.exports = {
  AuthServiceClient,
  MALFORMED_RESPONSE,
  MALFORMED_REQUEST,
  UNEXPECTED_STATUS_CODE
};
