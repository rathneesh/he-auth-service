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
      .error(e => {
        cb(new Error("JOSE encryption failed"), null);
      });
  });
};

let decryptWithKey = (pem, payload, cb) => {
  let keystore = jose.JWK.createKeyStore();

  keystore.add(pem, "pem", {use: 'enc'}).then(result => {
    let kid = result.kid;

    jose.JWE.createDecrypt(keystore.get(kid))
      .decrypt(payload)
      .then(decryptedPayload => {
        cb(null, decryptedPayload);
      })
      .error(e => {
        cb(new Error("JOSE decryption failed"), null);
      });
  });
};

exports.encryptWithKey = encryptWithKey;
exports.decryptWithKey = decryptWithKey;
