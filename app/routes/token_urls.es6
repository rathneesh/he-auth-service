let tokenUrl = require('../resources/token_url.es6');
let jwt = require('jsonwebtoken');
let NodeRSA = require('node-rsa');
let util = require('util');

let key = new NodeRSA({b: 512});
let pem = key.exportKey('pkcs1-private-pem');

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
        pem, { algorithm: 'RS256', expiresIn: ttl});

    let errors = req.validationErrors();
    if (errors) {
        res.send('There have been validation errors: ' + util.inspect(errors), 400);
        return;
    }

    res.send(tokenUrl(token), 200);
};

let validateToken = (req, res) => {
    console.log("token");
    console.log(req.params.token);
    console.log("jwtkey");
    console.log(jwtKey);
    jwt.verify(req.params.token, pem, function(err, decoded) {
        if (err) {
            return console.log("failed to decoede");
        } else {
            console.log("decoded");
            console.log(decoded);
            if (decoded.exp < Date.now() / 1000) {
                console.log("expired");
            }
        }
    });
};

exports.createToken = createToken;
exports.validateToken = validateToken;
