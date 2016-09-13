let tokenUrl = require('../resources/token_url.es6');
let tokenUrlResponse = require('../resources/token_url_response.es6');
let strings = require('../resources/strings.es6');
let jwt = require('jsonwebtoken');
let util = require('util');
let uuid = require('uuid4');

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

    // sign with RSA SHA256
    var token = jwt.sign(
        {
            "iss": "HE_AUTH_SERVICE_ISSUER",
            "aud": [ "HE_AUTH_SERVICE_AUDIENCE" ],
            "iat": rightNow,
            "jti": "72747e4c-e38c-421e-88b6-d644cf322471",
            "bot_info": req.body.bot_info,
            "user_info": req.body.user_info,
            "integration_info": req.body.integration_info
        },
        secret, { expiresIn: ttl });

    let errors = req.validationErrors();
    if (errors) {
        return res.status(500).send({
            message: 'There have been validation errors: ' + util.inspect(errors)
        });
    } else {
        return res.status(201).send(
            tokenUrlResponse(
                strings.TOKEN_URL_RESPONSE_CREATE_MSG,
                token,
                tokenUrl(token)
            )
        );
    }
};

let validateToken = (req, res) => {
    if (req.params.token) {
        jwt.verify(req.params.token, secret, function(err, decoded) {
            if (err) {
                return res.status(404).send(
                    tokenUrlResponse(
                        strings.TOKEN_URL_RESPONSE_NOT_FOUND_MSG,
                        req.params.token,
                        ""
                    )
                );
            } else {
                if (decoded.exp < Date.now() / 1000) {
                    return res.status(404).send(
                        tokenUrlResponse(
                            strings.TOKEN_URL_RESPONSE_NOT_FOUND_MSG,
                            req.params.token,
                            ""
                        )
                    )
                } else {
                    return res.status(200).send(
                        tokenUrlResponse(
                            strings.TOKEN_URL_RESPONSE_VERIFY_MSG,
                            decoded,
                            ""
                        )
                    )
                }
            }
        });
    } else {
        return res.status(500).send({
            message: 'No token provided as part of the URL.'
        });
    }
};

exports.createToken = createToken;
exports.validateToken = validateToken;
