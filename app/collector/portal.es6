const socket = require('socket.io-client');

class IdentityPortal {
  constructor(config) {
    if (!config) {
      throw noConfigError;
    }
    this.endpoint = config.endpoint;
    //this.clientCreds = config.clientCreds;

    if (!this.configOk()) {
      console.log(config);
      throw missingConfigParam;
    }

    this.io = socket(this.endpoint);

    this.io.on('connect', () => {
      console.log('Connected successfully');
    });
  }

  configOk() {
    return !!this.endpoint;
  }

  collectSecrets(cb) {
    //console.log('Sending collectSecrets msg');
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
    this.io.emit('newToken', token, cb);
  }

  disconnect(cb) {
    if (this.io && this.io.connected) {
      this.io.disconnect(err => {
        if (err) {
          return cb(err, 'ok');
        }
      });
    }
    cb(null, 'ok')
  }
}

module.exports = {IdentityPortal};