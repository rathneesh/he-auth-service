let secretsModel = require('../../models/secrets.es6');

let storeSecret = (integration, user, secrets, cb) => {
  // TODO: add validation of inputs
  if (integration.auth && integration.auth.type === 'basic_auth') {
    secrets = {
      token: new Buffer(secrets.username + ':' + secrets.password).toString('base64')
    };
  }
  let payload = {
    /* eslint-disable camelcase */
    integration_info: integration,
    user_info: user,
    secrets: secrets
  };

  console.log('Saving secrets', payload);
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
