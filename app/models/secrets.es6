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

let app = require('../../server.es6');
let stringsResource = require('../resources/strings.es6');
let log = require('../resources/fluentd.es6');

class SecretsList {
  removeSecret(id, cb) {
    app.vault.delete({id})
      .then(function success(secret) {
        log.info(`Succesfully deleted secret for ${id}`);
        cb(null);
      })
      .catch(function failure() {
        log.info(`Could not read secret for ${id}`);
        cb(new Error(stringsResource.SECRETS_FAILED_TO_DELETE));
      });
  }

  addSecret(id, secret, cb) {
    app.vault.write({body: secret, id})
      .then(resp => {
        log.info(`Succesfully wrote secret for ${id}`);
        cb(null, resp);
      })
      .catch(e => {
        log.info(`Could not write secret for ${id}`);
        log.info(e);
        cb(new Error(stringsResource.SECRETS_FAILED_TO_WRITE), null);
      });
  }

  getSecret(id, cb) {
    app.vault.read({id})
      .then(function success(secret) {
        log.info(`Succesfully read secret for ${id}`);
        cb(null, secret);
      })
      .catch(function failure() {
        log.info(`Could not read secret for ${id}`);
        cb(new Error(stringsResource.SECRETS_FAILED_TO_READ), null);
      });
  }
}

module.exports = exports = new SecretsList();
