exports.TOKEN_URL_RESPONSE_CREATE_MSG = "token_url created";
exports.TOKEN_URL_RESPONSE_VERIFY_MSG = "token_url verified";
exports.TOKEN_URL_RESPONSE_DELETE_MSG = "token_url deleted";
exports.TOKEN_URL_RESPONSE_NOT_FOUND_MSG = "token_url not found";

exports.INTERNAL_SERVER_ERROR_MSG = "We're experiencing an issue with this request. If this error persists, please let us know.";

/*
*   Strings for resource routes
*/
exports.SECRETS_ROUTE_INVALID_SECRETS = `Invalid secrets. Secrets is a JSON embeddable object, NOT intended to be sent as request or response on its own.`;
exports.SECRETS_ROUTE_INVALID_USER_INFO = `Invalid "user_info". This a JSON object that encapsulates chat user information
and it is embedded in a request or in a response.
{
    id: string
}
`;
exports.SECRETS_ROUTE_INVALID_INTEGRATION_NAME = `Invalid "integration_name". This a JSON object that encapsulates integration information
and it is embedded in a request or in a response.
{
    name: string
    auth: This object will vary depending on the authentication method required by the integration.
}
`;

/*
*   Strings schema validation
*/
exports.SCHEMA_REQUIREMENT_NOT_MET = `Arguments do not meet schema requirements`;

/*
*   Strings for secret routes
*/
exports.SECRETS_SUCCESS_DELETE_MSG = `Successfully deleted secrets at /secrets/<user_name>/<integration_name>`;
exports.SECRETS_SUCCESS_CREATE_MSG = `Successfully saved secrets at /secrets/<user_name>/<integration_name>`;
exports.SECRETS_SUCCESS_UPDATE_MSG = `Successfully updated secrets at /secrets/<user_name>/<integration_name>`;
exports.SECRETS_NOT_FOUND_MSG = `Error retrieving secrets at /secrets/<user_name>/<integration_name>`;
exports.SECRETS_FAILED_TO_WRITE = `There was an internal server error while writing secrets for <user_name>/<integration_name>`;
exports.SECRETS_FAILED_TO_WRITE_DUP = `A secret already exists for <user_name>/<integration_name>`;
exports.SECRETS_FAILED_TO_READ = `There was an internal server error while trying to read secrets for <user_name>/<integration_name>`;
exports.SECRETS_FAILED_TO_DELETE = `There was an internal server error while trying to delete secrets for <user_name>/<integration_name>`;
exports.SECRETS_UNAUTHORIZED_MSG = `Error authentication against integration <integration_name>`;
exports.SECRETS_INTERNAL_ERROR_MSG = `There was an internal server error while retrieving secrests at /secrets/<user_name>/<integration_name>`;


exports.DEFAULT_ISSUER = "HE_DEFAULT_ISSUER";
exports.DEFAULT_AUDIENCE = "HE_DEFAULT_AUDIENCE";