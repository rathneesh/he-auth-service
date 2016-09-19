let tokenUrl = require('../resources/token_url.es6');
let tokenUrlResponse = require('../resources/token_url_response.es6');
let stringsResource = require('../resources/strings.es6');
let jwt = require('jsonwebtoken');
let util = require('util');
let uuid = require('uuid4');
let server = require('../../server.es6');

// TODO: assign and store uuid password for each token created
let secret = uuid();

let createToken = (req, res) => {
    req.checkBody('user_info', 'Invalid user_info').notEmpty();
    req.checkBody('integration_info', 'Invalid integration_info').notEmpty();
    req.checkBody('bot_info', 'Invalid bot_info').notEmpty();
    req.checkBody('url_props', 'Invalid url_props').notEmpty();
    req.checkBody('url_props.ttl', 'Invalid url_props.ttl').notEmpty().isInt();

    let rightNow = Date.now() / 1000;
    let ttl = req.body.url_props.ttl;

    let issuer = server.app.get("jwt_issuer");
    let audience = server.app.get("jwt_audience");

    // Validate fields. Exit if invalid.
    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).send({
            message: 'There have been validation errors: ' + util.inspect(errors)
        });
    }

    // sign with RSA SHA256
    let payload = {
        "iss": issuer,
        "aud": [ audience ],
        "iat": rightNow,
        "jti": uuid(),
        "bot_info": req.body.bot_info,
        "user_info": req.body.user_info,
        "integration_info": req.body.integration_info
    };
    let options = {
        expiresIn: ttl
    };
    let token = jwt.sign(
        payload,
        secret,
        options
    );

    return res.status(201).send(
        tokenUrlResponse(
            stringsResource.TOKEN_URL_RESPONSE_CREATE_MSG,
            token,
            tokenUrl(token)
        )
    );
};

let validateToken = (req, res) => {
    if (req.params.token) {
        jwt.verify(req.params.token, secret, function(err, decoded) {
            if (err) {
                return res.status(404).send(
                    tokenUrlResponse(
                        stringsResource.TOKEN_URL_RESPONSE_NOT_FOUND_MSG,
                        req.params.token,
                        server.he_identity_portal_endpoint + "/signin/" + req.params.token
                    )
                );
            } else {
                if (decoded.exp < (Date.now() / 1000)) {
                    return res.status(404).send(
                        tokenUrlResponse(
                            stringsResource.TOKEN_URL_RESPONSE_NOT_FOUND_MSG,
                            req.params.token,
                            server.he_identity_portal_endpoint + "/signin/" + req.params.token
                        )
                    )
                } else {
                    return res.status(200).send(
                        tokenUrlResponse(
                            stringsResource.TOKEN_URL_RESPONSE_VERIFY_MSG,
                            decoded,
                            server.he_identity_portal_endpoint + "/signin/" + req.params.token
                        )
                    )
                }
            }
        });
    } else {
        return res.status(404).send({
            message: stringsResource.TOKEN_URL_RESPONSE_NOT_FOUND_MSG
        });
    }
};

exports.createToken = createToken;
exports.validateToken = validateToken;
