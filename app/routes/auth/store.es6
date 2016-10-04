let Joi = require('joi');
let stringsResource = require('../../resources/strings.es6');
let app = require('../../../server.es6');
let log = require('winston');
let secretsModel = require('../../models/secrets.es6');

let storeSecret = (integration, user, secrets, cb) => {
    let schema = Joi.object().keys({
        integration: Joi.string().required(),
        user: Joi.string().required(),
        secrets: Joi.object().required()
    });

    let result = Joi.validate({ integration, user, secrets }, schema);

    let noError = null

    if (result.error === noError) {
        secretsModel.getSecret(`${integration}/${user}`, (err, secret) => {
            if (!err) {
                log.info(`There already exists a secret with id ${integration}/${user}`);
                return cb(new Error(stringsResource.SECRETS_FAILED_TO_WRITE_DUP));
            }

            secretsModel.addSecret(`${integration}/${user}`, secrets, (err) => {
                if (err) {
                    return cb(err);
                }

                cb(null);
            });
        });
    } else {
        cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET));
    }
};

let readSecret = (integration, user, cb) => {
    let schema = Joi.object().keys({
        integration: Joi.string().required(),
        user: Joi.string().required()
    });

    let result = Joi.validate({ integration, user }, schema);

    let noError = null

    if (result.error === noError) {
        secretsModel.getSecret(`${integration}/${user}`, (err, secret) => {
            if (err) {
                return cb(err, null);
            }

            cb(null, secret);
        });
    } else {
        cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET), false)
    }
};

let deleteSecret = (integration, user, cb) => {
    let schema = Joi.object().keys({
        integration: Joi.string().required(),
        user: Joi.string().required()
    });

    let result = Joi.validate({ integration, user }, schema);

    let noError = null

    if (result.error === noError) {
        secretsModel.removeSecret(`${integration}/${user}`, (err) => {
            if (err) {
                return cb(err);
            }

            cb(null);
        });
    } else {
        cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET), false)
    }
};

let updateSecret = (integration, user, secrets, cb) => {
    let schema = Joi.object().keys({
        integration: Joi.string().required(),
        user: Joi.string().required(),
        secrets: Joi.object().required()
    });

    let result = Joi.validate({ integration, user, secrets }, schema);

    let noError = null

    if (result.error === noError) {
        secretsModel.getSecret(`${integration}/${user}`, (err, oldSecret) => {
            if (err) {
                log.info(`There is no secret with id ${integration}/${user}. Can't PUT.`);
                return cb(new Error(stringsResource.SECRETS_NOT_FOUND_MSG));
            }

            let newSecret = secrets;

            let mergedSecret = Object.assign({}, oldSecret, newSecret);

            secretsModel.addSecret(`${integration}/${user}`, mergedSecret, (err) => {
                if (err) {
                    return cb(err);
                }

                cb(null);
            });
        });
    } else {
        cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET));
    }
};

exports.storeSecret = storeSecret;
exports.readSecret = readSecret;
exports.deleteSecret = deleteSecret;
exports.updateSecret = updateSecret;