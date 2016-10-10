const socket = require('socket.io-client');

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
    this.io = socket(this.portalEndpoint);

    this.io.on('connect', () => {
      console.log('Connected successfully');
    });
  }

  configOk() {
    return !!this.portalEndpoint && !!this.authServiceEndpoint && !!this.datastoreEndpoint &&
      this.secretCollectionInterval !== 0 &&
      this.tokenCollectionInterval !== 0 && !!this.secretCollectionInterval && !!this.tokenCollectionInterval;
  }

  collectSecrets(cb) {
    //console.log('Sending collectSecrets msg');
    this.io.emit('collectSecrets', (err, secrets) => {
      if (err) {
        console.log('there was a server-side error collecting secrets', err);
        return cb(err, null);
      }
      if (secrets && secrets.length > 0) {
        cb(null, secrets);
      } else {
        cb(new Error('Error: no secrets or secrets empty'), null);
      }
    });
  }

  saveSecret(secret, cb) {
    // TODO: need he-auth-client
    // TODO: POST secrets to he-auth-service REST API and then emit updateStatus for each request.
    console.log('saving secret');
    let status = null;
    cb(new Error('error saving secret: ' + JSON.stringify(secret)), status);
  }

  updateStatus(token, cb) {
    // TODO: change to actual response, now forcing to be successful.
    this.io.emit('updateStatus', token, 'success');
    cb(new Error('Need to define update status'), null);
  }

  saveSecrets(secrets, cb) {
    secrets.forEach(secret => this.saveSecret(secret, cb));
  }

  saveToken(token, cb) {
    this.io.emit('newToken', token, cb);
  }

  // Start collectors
  collectInterval() {
    console.log('starting..');
    if (this.io.connected) {
      this.collectInterval = setInterval(this.collectSecrets.bind(this)(this.saveSecrets), this.secretCollectionInterval);
    }

    return true;
  }

  // Stop collectors
  stop() {
    console.log('stopping');
    clearInterval(this.collectInterval);
    this.io.socket.disconnect();
    return true;
  }
}

module.exports = {Collector};