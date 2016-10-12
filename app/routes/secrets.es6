let stringsResource = require('../resources/strings.es6');
let auth = require('./auth/authenticate.es6');
let store = require('./auth/store.es6');
let util = require('util');
let log = require('winston');

/* eslint-disable camelcase */

let authenticateSecrets = (req, res) => {
  req.checkBody('secrets',
    stringsResource.SECRETS_ROUTE_INVALID_SECRETS).notEmpty();
  req.checkBody('user_info',
    stringsResource.SECRETS_ROUTE_INVALID_USER_INFO).notEmpty();
  req.checkBody('user_info.id',
    stringsResource.SECRETS_ROUTE_INVALID_USER_INFO).notEmpty();
  req.checkBody('integration_name',
    stringsResource.SECRETS_ROUTE_INVALID_INTEGRATION_NAME).notEmpty();
  req.checkBody('integration_name.name',
    stringsResource.SECRETS_ROUTE_INVALID_INTEGRATION_NAME).notEmpty();

  // Validate fields. Exit if invalid.
  let errors = req.validationErrors();
  if (errors) {
    log.error("Validation errors detected in authenticateSecrets()");
    return res.status(500).send({
      message: 'There have been validation errors: ' + util.inspect(errors)
    });
  }

  auth.authenticateAgainst(req.body.integration_name.name,
    req.body.user_info.id, req.body.secrets, (err, success) => {
      if (err) {
        log.error(
          `Internal server error while authenticating against ${req.body.integration_name.name} as ${req.body.user_info.id} in authenticateSecrets(). Error: ${err}`
        );
        return res.status(500).send({
          message: `${stringsResource.SECRETS_SUCCESS_INTERNAL_ERROR_MSG}. ${err}`
        });
      }

      if (!success) {
        log.error(
          `Authentication against ${req.body.integration_name.name} as ${req.body.user_info.id} was not successful in authenticateSecrets()`
        );
        return res.status(401).send({
          message: stringsResource.SECRETS_SUCCESS_UNAUTHORIZED_MSG
        });
      }

      log.info(
        `Successful authentication against ${req.body.integration_name.name} as ${req.body.user_info.id}`
      );

      return store.storeSecret(req.body.integration_name.name, req.body.user_info.id, req.body.secrets, err => {
        if (err === null) {
          log.info(
            `Credentials have been stored for integration ${req.body.integration_name.name} as ${req.body.user_info.id}`
          );
          res.status(201).send(
            {
              message: stringsResource.SECRETS_SUCCESS_CREATE_MSG
            }
          );
        } else {
          log.error(
            `Internal server error while storing credentials for ${req.body.integration_name.name} as ${req.body.user_info.id} in authenticateSecrets(). ${err}`
          );
          res.status(500).send({
            message: `${stringsResource.SECRETS_INTERNAL_ERROR_MSG}. ${err}`
          });
        }
      });
    });
};

let readSecrets = (req, res) => {
  let userId = req.params.userId;
  let integrationName = req.params.integrationName;

  store.readSecret(integrationName, userId, (err, secrets) => {
    if (err || !secrets) {
      return res.status(404).send({
        message: stringsResource.SECRETS_NOT_FOUND_MSG
      });
    }
    res.status(200).send({
      secrets: secrets.data,
      user_info: {
        id: userId
      },
      integration_name: {
        name: integrationName
      }
    });
  });
};

let deleteSecrets = (req, res) => {
  let userId = req.params.userId;
  let integrationName = req.params.integrationName;

  store.deleteSecret(integrationName, userId, err => {
    if (err) {
      return res.status(404).send({
        message: `${err}`
      });
    }
    res.status(200).send({
      message: stringsResource.SECRETS_SUCCESS_DELETE_MSG
    });
  });
};

let updateSecrets = (req, res) => {
  req.checkBody('secrets',
    stringsResource.SECRETS_ROUTE_INVALID_SECRETS).notEmpty();
  req.checkBody('user_info',
    stringsResource.SECRETS_ROUTE_INVALID_USER_INFO).notEmpty();
  req.checkBody('user_info.id',
    stringsResource.SECRETS_ROUTE_INVALID_USER_INFO).notEmpty();
  req.checkBody('integration_name',
    stringsResource.SECRETS_ROUTE_INVALID_INTEGRATION_NAME).notEmpty();
  req.checkBody('integration_name.name',
    stringsResource.SECRETS_ROUTE_INVALID_INTEGRATION_NAME).notEmpty();

  // Validate fields. Exit if invalid.
  let errors = req.validationErrors();
  if (errors) {
    log.error("Validation errors detected in authenticateSecrets()");
    return res.status(500).send({
      message: 'There have been validation errors: ' + util.inspect(errors)
    });
  }

  auth.authenticateAgainst(req.body.integration_name.name,
    req.body.user_info.id, req.body.secrets, (err, success) => {
      if (err) {
        log.error(
          `Internal server error while authenticating against ${req.body.integration_name.name} as ${req.body.user_info.id} in authenticateSecrets(). Error: ${err}`
        );
        return res.status(500).send({
          message: `${stringsResource.SECRETS_SUCCESS_INTERNAL_ERROR_MSG}. ${err}`
        });
      }

      if (!success) {
        log.error(
          `Authentication against ${req.body.integration_name.name} as ${req.body.user_info.id} was not successful in authenticateSecrets()`
        );
        return res.status(401).send({
          message: stringsResource.SECRETS_SUCCESS_UNAUTHORIZED_MSG
        });
      }

      log.info(
        `Successful authentication against ${req.body.integration_name.name} as ${req.body.user_info.id}`
      );

      return store.updateSecret(req.body.integration_name.name,
        req.body.user_info.id, req.body.secrets, err => {
          if (err === null) {
            log.info(
              `Credentials have been updated for integration ${req.body.integration_name.name} as ${req.body.user_info.id}`
            );
            res.status(200).send(
              {
                message: stringsResource.SECRETS_SUCCESS_CREATE_MSG
              }
            );
          } else {
            log.error(
              `Internal server error while storing credentials for ${req.body.integration_name.name} as ${req.body.user_info.id} in authenticateSecrets(). ${err}`
            );
            res.status(500).send({
              message: `${stringsResource.SECRETS_INTERNAL_ERROR_MSG}. ${err}`
            });
          }
        });
    });
};

exports.authenticateSecrets = authenticateSecrets;
exports.readSecrets = readSecrets;
exports.deleteSecrets = deleteSecrets;
exports.updateSecrets = updateSecrets;
