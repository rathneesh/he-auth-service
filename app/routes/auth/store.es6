let Joi = require('joi');
let stringsResource = require('../../resources/strings.es6');
let app = require('../../../server.es6');
let log = require('winston');

let storeCredentials = (integration, user, secrets, cb) => {
    let schema = Joi.object().keys({
        integration: Joi.string().required(),
        user: Joi.string().required(),
        secrets: Joi.object().required()
    });

    let result = Joi.validate({ integration, user, secrets }, schema);

    let noError = null

    if (result.error === noError) {
        app.vault.write({
            body: secrets,
            id: `${integration}/${user}`
        })
        .then(function success() {
            log.info(`Succesfully wrote secret for ${integration}/${user}`);
            cb(null, true);
        })
        .catch(function failure() {
            log.info(`Could not write secret for ${integration}/${user}`);
            cb(new Error(stringsResource.SECRETS_FAILED_TO_WRITE), false)
        });
    } else {
        cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET), false)
    }
};

exports.storeCredentials = storeCredentials;