let stringsResource = require('../resources/strings.es6');
let auth = require('./auth/authenticate.es6');
let store = require('./auth/store.es6');
let util = require('util');
let log = require('winston');
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
    log.error("Validation errors detected in authenticateSecrets()");
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

    console.log(tokenString);

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
      let integration_name = decoded.integration_info;

      encrypt.decryptWithKey(server.keys.jweSecretsKey, req.body.secrets, (err, decryptedSecrets) => {
        if (err) {
          log.error("An error occurred while decrypting " +
            "secret. " + err.toString());
          return res.status(500).send({
            message: 'An error occurred while decrypting ' +
            'secret. ' + err.toString()
          });
        }

        auth.authenticateAgainst(integration_name, user_info, decryptedSecrets, (err, success) => {
          let decryptedSecretsObj;
          try {
            decryptedSecretsObj = JSON.parse(decryptedSecrets.payload.toString());
          } catch (e) {
            return res.status(500).send({
              message: e.toString()
            });
          }

          if (err) {
            log.error(
              `Internal server error while authenticating against ${integration_name} as ${user_info} in authenticateSecrets(). Error: ${err}`
            );
            return res.status(500).send({
              message: `${stringsResource.SECRETS_SUCCESS_INTERNAL_ERROR_MSG}. ${err}`
            });
          }

          if (!success) {
            log.error(
              `Authentication against ${integration_name} as ${user_info} was not successful in authenticateSecrets()`
            );
            return res.status(401).send({
              message: stringsResource.SECRETS_SUCCESS_UNAUTHORIZED_MSG
            });
          }

          log.info(
            `Successful authentication against ${integration_name} as ${user_info}`
          );

          store.storeSecret(integration_name, user_info, decryptedSecretsObj, (err, resp) => {
            if (err) {
              log.error(
                `Internal server error while storing credentials for ${integration_name} as ${user_info} in authenticateSecrets(). ${err}`
              );
              return res.status(500).send({
                message: `${stringsResource.SECRETS_INTERNAL_ERROR_MSG}. ${err}`
              });
            }
            log.info(
              `Credentials have been stored for integration ${integration_name} as ${user_info}`
            );
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
