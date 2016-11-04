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
