const portal = require('./portal.es6');
const noConfigError = require('./errors.es6').noConfigError;
const missingConfigParam = require('./errors.es6').missingConfigParam;
const authServiceClient = require('../client/client_lib.es6');
const urlTokens = require('../models/url_tokens.es6');
const log = require('winston');

const statuses = {
  success: {
    saveSecrets: "Successfully saved secrets"
  },
  failure: {
    saveSecrets: "Failed to save secrets"
  }
};

class Collector {
  constructor(config) {
    if (!config) {
      throw noConfigError;
    }
    this.portalEndpoint = config.portalEndpoint;
    this.authServiceEndpoint = config.authServiceEndpoint;
    this.datastoreEndpoint = config.datastoreEndpoint;
    this.secretCollectionInterval = config.secretCollectionInterval;
    this.tokenCollectionInterval = config.tokenCollectionInterval;
    if (!this.configOk()) {
      throw missingConfigParam;
    }

    this.tokenListState = null;

    this.portal = new portal.IdentityPortal({endpoint: this.portalEndpoint});
    this.authService = new authServiceClient.AuthServiceClient({endpoint: this.authServiceEndpoint});
  }

  configOk() {
    return Boolean(this.portalEndpoint) && Boolean(this.authServiceEndpoint) && Boolean(this.datastoreEndpoint) &&
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
            return console.log('error in collector (secrets)') &&
              portal.updateStatus(secrets.token, statuses.failure.saveSecrets, (err, resp) => {
                if (err) {
                  log.error("An error occurred while sending update status to portal. " + err.toString());
                }
                console.log(resp);
                console.log("sent failed status");
              });
          }
          this.sendToAuthService(secrets.secret, secrets.token, (err, resp) => {
            portal.updateStatus(secrets.token, statuses.success.saveSecrets, (err, resp) => {
              if (err) {
                log.error("An error occurred while sending update status to portal. " + err.toString());
              }
              console.log(resp);
              log.info("An error occurred while sending update status to portal. " + err.toString());
              console.log("sent success status");
            });
          });
        });
      }, this.secretCollectionInterval);

      this.collectTokensInterval = setInterval(() => {
        let state = urlTokens.getState();

        let stateHasChanged = (() => {
          return this.tokenListState === state;
        })();
        // Do we want to send the token that was added or the whole tokens array?
        if (stateHasChanged) {
          let tokens = urlTokens.getTokens();
          // Wouldn't having urlTokens publish (each time a new token is added) be a better solution?
          for (let i = 0; i <= tokens.length; i++) {
            portal.saveToken(tokens[i], (err, resp) => {
              console.log("sent token to portal");
            });
          }
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

  sendToAuthService(secret, token, cb) {
    const secretRequest = {
      secret,
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
