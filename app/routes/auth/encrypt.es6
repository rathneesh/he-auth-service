let jose = require('node-jose');

let encryptWithKey = (pem, payload, cb) => {
  let keystore = jose.JWK.createKeyStore();

  keystore.add(pem, "pem", {use: 'enc'}).then(result => {
    let kid = result.kid;

    jose.JWE.createEncrypt({format: 'compact'}, keystore.get(kid))
      .update(payload).final()
      .then(encryptedPayload => {
        cb(null, encryptedPayload);
      })
      .catch(e => {
        cb(e, null);
      });
  });
};

let decryptWithKey = (pem, payload, cb) => {
  let keystore = jose.JWK.createKeyStore();
  console.log(pem);
  /* eslint-disable camelcase */
  keystore.add(pem, "pem", {key_opts: 'decrypt'}).then(key => {
    console.log(key);
    jose.JWE.createDecrypt(key)
      .decrypt(payload)
      .then(decryptedPayload => {
        cb(null, decryptedPayload);
      })
      .catch(e => {
        cb(e, null);
      });
  });
};

exports.encryptWithKey = encryptWithKey;
exports.decryptWithKey = decryptWithKey;
