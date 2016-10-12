let jose = require('node-jose');
let log = require('winston');
let stringsResource = require('../../resources/strings.es6');

let encryptWithKey = (pem, payload, cb) => {
    let keystore = jose.JWK.createKeyStore();

    keystore.add(pem, "pem", {use: 'enc'}).then(result => {
        let kid = result.kid;

        jose.JWE.createEncrypt({format: 'compact'}, keystore.get(kid))
            .update(payload).final()
            .then(encryptedPayload => {
                cb(null, encryptedPayload);
            })
            .error(e => {
                cb(new Error("JOSE encryption failed"), null);
            });
    });
};

exports.encryptWithKey = encryptWithKey;
