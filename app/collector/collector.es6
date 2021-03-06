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

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const portal = require('he-identity-portal').client;
const noConfigError = require('./errors.es6').noConfigError;
const missingConfigParam = require('./errors.es6').missingConfigParam;
const authServiceClient = require('../client/client_lib.es6');
const urlTokens = require('../models/url_tokens.es6');
const log = require('../resources/fluentd.es6');

class Collector {
  constructor(config) {
    if (!config) {
      throw noConfigError;
    }
    this.portalEndpoint = config.portalEndpoint;
    this.authServiceEndpoint = config.authServiceEndpoint;
    this.tokenCollectionInterval = config.tokenCollectionInterval;
    if (!this.configOk()) {
      throw missingConfigParam;
    }

    this.tokenListState = null;

    this.portal = new portal.IdentityPortal({endpoint: this.portalEndpoint});
    let authServiceConfig = {
      endpoint: this.authServiceEndpoint
    };

    if (config.selfSignedCerts) {
      authServiceConfig.selfSignedCerts = true;
    }
    this.authService = new authServiceClient.AuthServiceClient(
      authServiceConfig);
  }

  configOk() {
    return Boolean(this.portalEndpoint) && Boolean(this.authServiceEndpoint) &&
      this.tokenCollectionInterval !== 0 && Boolean(this.tokenCollectionInterval);
  }

  // Start collectors
  start(cb) {
    let portal = this.portal;
    // Make sure we stop collectors first
    this.stop(() => {
      this.collectTokensInterval = setInterval(() => {
        let state = urlTokens.getState();

        let stateHasChanged = (() => {
          return !(this.tokenListState === state);
        })();

        // Do we want to send the token that was added or the whole tokens array?
        if (stateHasChanged) {
          let tokens = urlTokens.getTokens();
          if (tokens.length > 0) {
            log.info('Tokens available, collecting tokens');
          }
          // Wouldn't having urlTokens publish (each time a new token is added) be a better solution?
          tokens.forEach(token => {
            portal.saveToken(token, (err, resp) => {
              if (err) {
                // TODO: retry tokens that failed to be sent to the portal.
                return log.error('Error sending token to portal, putting back into list', err);
              }
              log.debug('Success in sending token', resp);
            });
          });
          this.tokenListState = state;
        }
      }, this.tokenCollectionInterval);

      cb(null, 'ok');
    });
  }

  // Stop collectors
  stop(cb) {
    if (this.collectTokensInterval)
      clearInterval(this.collectTokensInterval);
    cb(null, 'ok');
  }

  // Disconnect all clients
  disconnect(cb) {
    let portal = this.portal;
    this.stop(err => {
      if (err) {
        cb(err, null);
      } else {
        // TODO: disconnect any other clients
        portal.disconnect(cb);
      }
    });
  }

  // Check all collectors running
  running() {
    return Boolean(this.collectTokensInterval);
  }
}

module.exports = {Collector};
