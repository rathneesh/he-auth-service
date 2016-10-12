let tokenUrl = require('../resources/token_url.es6');
let tokenUrlResponse = require('../resources/token_url_response.es6');
let stringsResource = require('../resources/strings.es6');
let jwt = require('jsonwebtoken');
let log = require('winston');
let util = require('util');
let uuid = require('uuid4');
let server = require('../../server.es6');
let urlTokens = require('../models/url_tokens.es6');
let encrypt = require('./auth/encrypt.es6');
/* eslint-disable camelcase */

// TODO: assign and store uuid password for each token created
let secret = uuid();

let createToken = (req, res) => {
  req.checkBody('user_info', 'Invalid user_info').notEmpty();
  req.checkBody('integration_info', 'Invalid integration_info').notEmpty();
  req.checkBody('bot_info', 'Invalid bot_info').notEmpty();
  req.checkBody('url_props', 'Invalid url_props').notEmpty();
  req.checkBody('url_props.ttl', 'Invalid url_props.ttl').notEmpty().isInt();

  let rightNow = Date.now() / 1000;
  let issuer = server.app.get("jwt_issuer");
  let audience = server.app.get("jwt_audience");

  // Validate fields. Exit if invalid.
  let errors = req.validationErrors();
  if (errors) {
    return res.status(500).send({
      message: 'There have been validation errors: ' + util.inspect(errors)
    });
  }

  // sign with RSA SHA256
  let payload = {
    iss: issuer,
    aud: [audience],
    iat: rightNow,
    jti: uuid(),
    bot_info: req.body.bot_info,
    user_info: req.body.user_info,
    integration_info: req.body.integration_info
  };

  // Sign JWT with private key
  jwt.sign(payload, server.keys.jwtToken, {algorithm: 'RS256'},
    (err, token) => {
      if (err) {
        log.error("An error occurred while creating token. " + err.toString());
        return res.status(500).send({
          message: 'An error occurred while creating token: ' + err.toString()
        });
      }

      // Add it to the token bag before sending
      urlTokens.addToken(token);

      encrypt.encryptWithKey(server.keys.jweTokenUrlPub, token,
        (err, encryptedToken) => {
          if (err) {
            log.error("An error occurred while encrypting " +
              "token. " + err.toString());
            return res.status(500).send({
              message: 'An error occurred while encrypting ' +
              'token: ' + err.toString()
            });
          }

          res.status(201).send(
            tokenUrlResponse(
              stringsResource.TOKEN_URL_RESPONSE_CREATE_MSG,
              encryptedToken,
              tokenUrl(encryptedToken)
            )
          );
        });
    });
};

let validateToken = (req, res) => {
  console.log('has token:');
  console.log(urlTokens.hasToken(req.params.token));
  if (req.params.token && urlTokens.hasToken(req.params.token)) {
    jwt.verify(req.params.token, secret, (err, decoded) => {
      if (err) {
        return res.status(404).send(
          tokenUrlResponse(
            stringsResource.TOKEN_URL_RESPONSE_NOT_FOUND_MSG,
            req.params.token,
            server.he_identity_portal_endpoint + "/signin/" + req.params.token
          )
        );
      }
      if (decoded.exp < (Date.now() / 1000)) {
        return res.status(404).send(
          tokenUrlResponse(
            stringsResource.TOKEN_URL_RESPONSE_NOT_FOUND_MSG,
            req.params.token,
            server.he_identity_portal_endpoint + "/signin/" + req.params.token
          )
        );
      }
      return res.status(200).send(
        tokenUrlResponse(
          stringsResource.TOKEN_URL_RESPONSE_VERIFY_MSG,
          decoded,
          server.he_identity_portal_endpoint + "/signin/" + req.params.token
        )
      );
    });
  } else {
    return res.status(404).send({
      message: stringsResource.TOKEN_URL_RESPONSE_NOT_FOUND_MSG
    });
  }
};

let deleteToken = (req, res) => {
  let token = req.params.token;
  if (token && urlTokens.hasToken(token)) {
    if (urlTokens.removeToken(token)) {
      return res.status(200).send(
        tokenUrlResponse(
          stringsResource.TOKEN_URL_RESPONSE_DELETE_MSG,
          token,
          server.he_identity_portal_endpoint + "/signin/" + token
        )
      );
    }
    return res.status(500).send(
      tokenUrlResponse(
        stringsResource.INTERNAL_SERVER_ERROR_MSG,
        token,
        ''
      )
    );
  }
  return res.status(404).send({
    message: stringsResource.TOKEN_URL_RESPONSE_NOT_FOUND_MSG
  });
};

exports.createToken = createToken;
exports.validateToken = validateToken;
exports.deleteToken = deleteToken;
