const portal = require('./portal.es6');
const noConfigError = require('./errors.es6').noConfigError;
const missingConfigParam = require('./errors.es6').missingConfigParam;

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

    this.portal = new portal.IdentityPortal({endpoint: this.portalEndpoint});
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
      this.collectInterval = setInterval(() => {
        portal.collectSecrets((err, secrets) => {
          if (err) {
            console.log('error in collector (secrets)');
          } else console.log('secrets received in collector', secrets);
        });
      }, this.secretCollectionInterval);
      cb(null, 'ok');
    });
  }

  // Stop collectors
  stop(cb) {
    if (this.collectInterval)
      clearInterval(this.collectInterval);
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
    return Boolean(this.collectInterval);
  }
}

module.exports = {Collector};
