let stringsResource = require('../../resources/strings.es6');
const _ = require('lodash');

let authenticateAgainst = (integration, user, secrets, cb) => {
  if (!_.has(integration, 'name') || !_.has(user, 'id') || !_.has(integration, 'auth') || !_.isObject(secrets)
  ) {
    return cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET), false);
  }

  // TODO: need to parse auth method and actually perform auth
  let credentialsValidator = callback => {
    callback(null, true);
  };

  credentialsValidator(cb);
};

exports.authenticateAgainst = authenticateAgainst;
