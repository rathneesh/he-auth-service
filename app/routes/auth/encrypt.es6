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
