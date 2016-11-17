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

let secretsModel = require('../../models/secrets.es6');
const log = require('./../../resources/fluentd.es6');

let storeSecret = (integration, user, secrets, cb) => {
  let payload = {
    /* eslint-disable camelcase */
    integration_info: integration,
    user_info: user,
    secrets: secrets
  };

  log.debug('Saving secrets', payload);
  // TODO: modify secrets depending on auth method. For basic auth use base64
  secretsModel.addSecret(`${user.id}/${integration.name}`, payload, (err, resp) => {
    if (err) {
      return cb(err, null);
    }
    cb(null, resp);
  });
};

let readSecret = (integrationName, userId, cb) => {
  // TODO: add input validation
  secretsModel.getSecret(`${userId}/${integrationName}`, (err, secret) => {
    if (err) {
      return cb(err, null);
    }

    cb(null, secret);
  });
};

exports.storeSecret = storeSecret;
exports.readSecret = readSecret;
