// Copyright 2016 Hewlett-Packard Development Company, L.P.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// END OF TERMS AND CONDITIONS

exports.TOKEN_URL_RESPONSE_CREATE_MSG = "token_url created";
exports.TOKEN_URL_RESPONSE_VERIFY_MSG = "token_url verified";
exports.TOKEN_URL_RESPONSE_DELETE_MSG = "token_url deleted";
exports.TOKEN_URL_RESPONSE_NOT_FOUND_MSG = "token_url not found";
exports.TOKEN_URL_INVALID = "token_url not found";

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

/*
 *   Strings for authentication module
 */
exports.INTEGRATION_AUTH_SECRETS_MISSING = "Secrets missing from payload.";
exports.INTEGRATION_AUTH_INFO_MISSING = "Information to perform authentication is missing from payload (token).";
exports.INTEGRATION_AUTH_ENDPOINT_MISSING = "Endpoint missing from parameter list";
exports.INTEGRATION_AUTH_URL_MISSING = "Endpoint url not provided in integration registration.";
exports.INTEGRATION_AUTH_VERB_MISSING = "Endpoint verb parameter missing from integration registration.";
exports.INTEGRATION_AUTH_VERB_NOT_SUPPORTED = "Endpoint verb parameter not supported.";
exports.INTEGRATION_AUTH_USERNAME_MISSING = "Username missing from secrets payload.";
exports.INTEGRATION_AUTH_PASSWORD_MISSING = "Password missing from secrets payload.";
exports.INTEGRATION_AUTH_USER_STRUCTURE_MISSING = "USER object was not provided.";
exports.INTEGRATION_AUTH_TENANT_STRUCTURE_MISSING = "TENANT object was not provided.";
exports.INTEGRATION_AUTH_USER_USERNAME_MISSING = "Credentials are malformed in the USER object. Username missing.";
exports.INTEGRATION_AUTH_USER_PASSWORD_MISSING = "Credentials are malformed in the USER object. Password missing.";
exports.INTEGRATION_AUTH_TENANT_USERNAME_MISSING = "Credentials are malformed in the TENANT object. Username missing.";
exports.INTEGRATION_AUTH_TENANT_PASSWORD_MISSING = "Credentials are malformed in the TENANT object. Password missing.";
exports.INTEGRATION_AUTH_UNEXPECTED_RESPONSE_FROM_AS = "Unexpected response from auth server.";
exports.INTEGRATION_AUTH_UNEXPECTED_STATUS_CODE_FROM_AS = "Unexpected 2xx status code from authentication server.";
exports.INTEGRATION_AUTH_SKIPPING_AUTHENTICATION = "Endpoint missing from parameter list. Skipping authentication step.";
