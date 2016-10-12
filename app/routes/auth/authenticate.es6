let Joi = require('joi');
let stringsResource = require('../../resources/strings.es6');

let authenticateAgainst = (integration, user, secrets, cb) => {
  let schema = Joi.object().keys({
    integration: Joi.string().required(),
    user: Joi.string().required(),
    secrets: Joi.object().required()
  });

  let result = Joi.validate({integration, user, secrets}, schema);

  let noError = null;

  if (result.error === noError) {
    let credentialsValidator = () => {
      // Do some magic
      return true;
    };
    cb(null, credentialsValidator());
  } else {
    cb(new Error(stringsResource.SCHEMA_REQUIREMENT_NOT_MET), false);
  }
};

exports.authenticateAgainst = authenticateAgainst;
