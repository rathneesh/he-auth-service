process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const portal = require('./portal.es6');
const noConfigError = require('./errors.es6').noConfigError;
const missingConfigParam = require('./errors.es6').missingConfigParam;
const authServiceClient = require('../client/client_lib.es6');
const urlTokens = require('../models/url_tokens.es6');
const log = require('winston');

const statuses = {
  success: 'success',
  failure: 'failed'
};

class Collector {
  constructor(config) {
    if (!config) {
      throw noConfigError;
    }
    this.portalEndpoint = config.portalEndpoint;
    this.authServiceEndpoint = config.authServiceEndpoint;
    this.secretCollectionInterval = config.secretCollectionInterval;
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
      this.secretCollectionInterval !== 0 &&
      this.tokenCollectionInterval !== 0 && Boolean(this.secretCollectionInterval) && Boolean(this.tokenCollectionInterval);
  }

  // Start collectors
  start(cb) {
    let portal = this.portal;
    // Make sure we stop collectors first
    this.stop(() => {
      this.collectSecretsInterval = setInterval(() => {
        // is `secrets` and incoming secrets array or is it a single secret?
        portal.collectSecrets((err, secrets) => {
          if (err) {
            return console.log('error in collector (secrets)');
          }
          console.log('collected', secrets);
          secrets.forEach(secret => {
            this.sendToAuthService(secret.secret, secret.token, (err, resp) => {
              if (err) {
                console.log('Error posting secrets with token:', secret.token);
                console.log('error', err);
                portal.updateStatus(secret.token, statuses.failure, (err, resp) => {
                  if (err) {
                    return log.error("An error occurred while sending update status to portal. " + err.toString());
                  }
                  console.log('Success in updating status to ' + statuses.failure);
                });
              } else {
                portal.updateStatus(secret.token, statuses.success, (err, resp) => {
                  if (err) {
                    return log.error("An error occurred while sending update status to portal. " + err.toString());
                  }
                  console.log("sent success status");
                });
              }
            });
          });
        });
      }, this.secretCollectionInterval);

      this.collectTokensInterval = setInterval(() => {
        let state = urlTokens.getState();

        let stateHasChanged = (() => {
          return !(this.tokenListState === state);
        })();

        // Do we want to send the token that was added or the whole tokens array?
        if (stateHasChanged) {
          let tokens = urlTokens.getTokens();
          if (tokens.length > 0) {
            console.log('Tokens available, collecting tokens');
          }
          // Wouldn't having urlTokens publish (each time a new token is added) be a better solution?
          tokens.forEach(token => {
            portal.saveToken(token, (err, resp) => {
              if (err) {
                // TODO: retry tokens that failed to be sent to the portal.
                return console.log('Error sending token to portal, putting back into list', err);
              }
              console.log('Success in sending token', resp);
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
    if (this.collectSecretsInterval)
      clearInterval(this.collectSecretsInterval);
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
    return Boolean(this.collectSecretsInterval) && Boolean(this.collectTokensInterval);
  }

  sendToAuthService(secrets, token, cb) {
    const secretRequest = {
      secrets,
      token
    };

    this.authService.saveSecrets(secretRequest, (err, resp) => {
      if (err) {
        return cb(err, resp);
      }

      cb(null, resp);
    });
  }
}

module.exports = {Collector};
