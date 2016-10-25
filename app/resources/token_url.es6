let server = require('../../server.es6');
const tokenSchema = "<he_identity_portal_endpoint>/portal/<jwt_token>";

module.exports = exports = token => {
  return tokenSchema
    .replace("<he_identity_portal_endpoint>", server.he_identity_portal_endpoint)
    .replace("<jwt_token>", token);
};
