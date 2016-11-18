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

let stringsResource = require('../resources/strings.es6');
let auth = require('./auth/authenticate.es6');
let store = require('./auth/store.es6');
let util = require('util');
let log = require('../resources/fluentd.es6');
let jwt = require('jsonwebtoken');
let encrypt = require('./auth/encrypt.es6');
let server = require('../../server.es6');

/* eslint-disable camelcase */

let authenticateSecrets = (req, res) => {
  req.checkBody('token',
    stringsResource.TOKEN_URL_INVALID).notEmpty();
  req.checkBody('secrets',
    stringsResource.SECRETS_ROUTE_INVALID_SECRETS).notEmpty();

  // Validate fields. Exit if invalid.
  let errors = req.validationErrors();
  if (errors) {
    log.error("Validation errors detected in authenticateSecrets()" + util.inspect(errors));
    return res.status(500).send({
      message: 'There have been validation errors: ' + util.inspect(errors)
    });
  }

  log.info('Decrypting token');
  encrypt.decryptWithKey(server.keys.jweTokenUrl, req.body.token, (err, decryptedToken) => {
    if (err) {
      log.error("An error occurred while decrypting " +
        "token. " + err.toString());
      return res.status(500).send({
        message: 'An error occurred while decrypting ' +
        'token: ' + err.toString()
      });
    }

    let tokenString = decryptedToken.payload.toString();

    jwt.verify(tokenString, server.keys.jwtTokenPub, (err, decoded) => {
      if (err) {
        log.error("An error occurred while verifying the " +
          "token. " + err.toString());
        return res.status(500).send({
          message: 'An error occurred while encrypting ' +
          'token: ' + err.toString()
        });
      }

      let user_info = decoded.user_info;
      let userId = user_info.id;
      let integration_info = decoded.integration_info;
      let integration_name = integration_info.name;
      let auth_config = decoded.integration_info.auth;
      let authMethod = integration_info.auth.type;
      encrypt.decryptWithKey(server.keys.jweSecretsKey, req.body.secrets, (err, decryptedSecrets) => {
        if (err) {
          log.error("An error occurred while decrypting " +
            "secret. " + err.toString());
          return res.status(500).send({
            message: 'An error occurred while decrypting ' +
            'secret. ' + err.toString()
          });
        }

        let decryptedSecretsObj;
        try {
          decryptedSecretsObj = JSON.parse(decryptedSecrets.payload.toString());
        } catch (e) {
          return res.status(500).send({
            message: e.toString()
          });
        }

        auth.authenticateAgainst(integration_info, user_info, auth_config, decryptedSecretsObj, (err, readyToStoreSecrets) => {
          if (err) {
            log.error(
              `Internal server error while authenticating against ${integration_name} as ${userId} in authenticateSecrets(). Error: ${err}`
            );
            return res.status(500).send({
              message: `${stringsResource.SECRETS_SUCCESS_INTERNAL_ERROR_MSG}. ${err}`
            });
          }

          if (!readyToStoreSecrets) {
            log.error(
              `Authentication against ${integration_name} as ${userId} was not successful in authenticateSecrets()`
            );
            return res.status(401).send({
              message: stringsResource.SECRETS_SUCCESS_UNAUTHORIZED_MSG
            });
          }

          log.info(
            `Successful authentication against ${integration_name} as ${userId} using method ${authMethod}`
          );

          store.storeSecret(integration_info, user_info, readyToStoreSecrets, (err, resp) => {
            if (err) {
              log.error(
                `Internal server error while storing credentials for ${integration_name} as ${userId} in authenticateSecrets(). ${err}`
              );
              return res.status(500).send({
                message: `${stringsResource.SECRETS_INTERNAL_ERROR_MSG}. ${err}`
              });
            }
            log.info(
              `Credentials have been stored for integration ${integration_name} as ${userId}`
            );
            if (resp)
              log.info(resp);
            return res.status(201).send(
              {
                message: stringsResource.SECRETS_SUCCESS_CREATE_MSG
              }
            );
          });
        });
      });
    });
  });
};

let readSecrets = (req, res) => {
  let userId = req.params.userId;
  let integrationName = req.params.integrationName;

  store.readSecret(integrationName, userId, (err, payload) => {
    if (err || !payload) {
      return res.status(404).send({
        message: stringsResource.SECRETS_NOT_FOUND_MSG
      });
    }
    res.status(200).send(payload.data);
  });
};

exports.authenticateSecrets = authenticateSecrets;
exports.readSecrets = readSecrets;
