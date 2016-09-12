let server = require('../../server.es6');

const tokenSchema = "<protocol>://<identity_fqdn>/signin/<jwt_token>";

module.exports = exports = function(token) {

    return tokenSchema
        .replace("<protocol>", server.protocol)
        .replace("<identity_fqdn>", server.identity_fqdn)
        .replace("<jwt_token>", token)
};