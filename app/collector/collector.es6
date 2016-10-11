const portal = require('./portal.es6');

const noConfigError = Error("configuration for collector is undefined");
const missingConfigParam = Error("configuration for collector has missing or invalid parameters");

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
    //this.clientCreds = config.clientCreds;
    if (!this.configOk()) {
      console.log(config);
      throw missingConfigParam;
    }

    this.portal = new portal.IdentityPortal({endpoint: this.portalEndpoint});
  }

  configOk() {
    return !!this.portalEndpoint && !!this.authServiceEndpoint && !!this.datastoreEndpoint &&
      this.secretCollectionInterval !== 0 &&
      this.tokenCollectionInterval !== 0 && !!this.secretCollectionInterval && !!this.tokenCollectionInterval;
  }

  //saveSecret(secret, cb) {
  //  // TODO: need he-auth-client
  //  // TODO: POST secrets to he-auth-service REST API and then emit updateStatus for each request.
  //  console.log('saving secret');
  //  let status = null;
  //  cb(new Error('error saving secret: ' + JSON.stringify(secret)), status);
  //}

  //saveSecrets(secrets, cb) {
  //  secrets.forEach(secret => this.saveSecret(secret, cb));
  //}

  // Start collectors
  start(cb) {
    let portal = this.portal;
    // Make sure we stop collectors first
    this.stop(() => {
      console.log('starting..');
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
    console.log('stopping');
    if (this.collectInterval)
      clearInterval(this.collectInterval);
    cb(null, 'ok');
  }

  // Disconnect all clients
  disconnect(cb) {
    let portal = this.portal;
    this.stop((err) => {
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
    return !!this.collectInterval;
  }
}

module.exports = {Collector};