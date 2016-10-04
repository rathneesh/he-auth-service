let app = require('../../server.es6');
let stringsResource = require('../resources/strings.es6');
let log = require('winston');

class SecretsList {
    removeSecret(id, cb) {
        app.vault.delete({
            id
        })
        .then(function success(secret) {
            log.info(`Succesfully deleted secret for ${id}`);
            cb(null)
        })
        .catch(function failure() {
            log.info(`Could not read secret for ${id}`);
            cb(new Error(stringsResource.SECRETS_FAILED_TO_DELETE))
        });
    }
    addSecret(id, secret, cb) {
        app.vault.write({
            body: secret,
            id
        })
        .then(function success() {
            log.info(`Succesfully wrote secret for ${id}`);
            cb(null);
        })
        .catch(function failure() {
            log.info(`Could not write secret for ${id}`);
            cb(new Error(stringsResource.SECRETS_FAILED_TO_WRITE))
        });
    }
    getSecret(id, cb) {
        app.vault.read({
            id
        })
        .then(function success(secret) {
            log.info(`Succesfully read secret for ${id}`);
            cb(null, secret)
        })
        .catch(function failure() {
            log.info(`Could not read secret for ${id}`);
            cb(new Error(stringsResource.SECRETS_FAILED_TO_READ), null)
        });
    }
}

module.exports = exports = new SecretsList();