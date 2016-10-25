const socket = require('socket.io-client');
const noConfigError = require('./errors.es6').noConfigError;
const missingConfigParam = require('./errors.es6').missingConfigParam;

class IdentityPortal {
  constructor(config) {
    if (!config) {
      throw noConfigError;
    }
    this.endpoint = config.endpoint;

    if (!this.configOk()) {
      throw missingConfigParam;
    }

    this.io = socket(this.endpoint);

    this.io.on('connect', () => {
      console.log('Connecting to portal', this.endpoint);
    });
  }

  configOk() {
    return Boolean(this.endpoint);
  }

  collectSecrets(cb) {
    this.io.emit('collectSecrets', (err, secrets) => {
      if (err) {
        console.log('there was a server-side error collecting secrets', err);
        return cb(err, null);
      }
      if (secrets && secrets.length > 0) {
        return cb(null, secrets);
      }
      cb(new Error('Error: no secrets or secrets empty'), null);
    });
  }

  updateStatus(token, status, cb) {
    // TODO: change to actual response, now forcing to be successful.
    this.io.emit('updateStatus', token, status, cb);
  }

  saveToken(token, cb) {
    this.io.emit('newToken', token, (err, resp) => {
      if (err) {
        return cb(err, null);
      }
      cb(null, resp);
    });
  }

  disconnect(cb) {
    if (this.io && this.io.connected) {
      this.io.disconnect(err => {
        if (err) {
          return cb(err, 'ok');
        }
      });
    }
    cb(null, 'ok');
  }

  connected() {
    return this.io.connected;
  }
}

module.exports = {IdentityPortal};
