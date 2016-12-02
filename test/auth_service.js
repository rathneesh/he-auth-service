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

const nock = require('nock');
const expect = require('chai').expect;
const encryptUtil = require('./../app/routes/auth/encrypt.es6');
const fs = require('fs');
const async = require('async');

// TODO: add test for TTL expiration.
// Disable eslint to allow for Nock generated objects
/* eslint-disable quote-props*/
/* eslint-disable no-unused-expressions */
/* eslint-disable camelcase */

process.env.HE_ISSUER = "issue";
process.env.HE_AUTH_SERVICE_PORT = 0;
process.env.HE_AUTH_NO_COLLECTOR = 1;
process.env.HE_AUDIENCE = "audience";
process.env.HE_AUTH_SSL_PASS = "default";
process.env.JWE_SECRETS_PATH = "./test/assets/jwe_secrets_assets.pem";
process.env.VAULT_DEV_ROOT_TOKEN_ID = "default";
process.env.HE_IDENTITY_PORTAL_ENDPOINT = "http://example.com";
process.env.HE_IDENTITY_WS_ENDPOINT = "http://example.com";
process.env.JWE_TOKEN_PATH = "./test/assets/jwe_secrets_assets.pem";
process.env.JWE_TOKEN_URL_PATH = "./test/assets/jwe_secrets_assets.pem";
process.env.JWT_TOKEN_PATH = "./test/assets/jwe_secrets_assets.pem";
process.env.JWE_TOKEN_URL_PATH_PUB = "./test/assets/jwe_secrets_pub_assets.pem";
process.env.JWT_TOKEN_PATH_PUB = "./test/assets/jwe_secrets_pub_assets.pem";
process.env.HE_AUTH_SSL_KEY = "./test/assets/key.pem";
process.env.HE_AUTH_SSL_CERT = "./test/assets/cert.pem";

if (process.env.HTTP_PROXY || process.env.http_proxy) {
  process.env.NO_PROXY = process.env.NO_PROXY ? process.env.NO_PROXY + ',vault' : 'vault';
  process.env.no_proxy = process.env.no_proxy ? process.env.no_proxy + ',vault' : 'vault';
  process.env.NO_PROXY = process.env.NO_PROXY ? process.env.NO_PROXY + ',basicauth' : 'basicauth';
  process.env.no_proxy = process.env.no_proxy ? process.env.no_proxy + ',basicauth' : 'basicauth';
}

nock('http://vault:8200', {"encodedQueryParams": true})
  .get('/v1/sys/init')
  .reply(200, {"initialized": true}, ['Content-Type',
    'application/json',
    'Date',
    'Tue, 01 Nov 2016 05:04:04 GMT',
    'Content-Length',
    '21',
    'Connection',
    'close']);

nock('http://vault:8200', {"encodedQueryParams": true})
  .get('/v1/sys/seal-status')
  .reply(200, {
    "sealed": false, "t": 1,
    "n": 1,
    "progress": 0,
    "version": "Vault v0.6.1",
    "cluster_name": "vault-cluster-8ed1001e",
    "cluster_id": "48a3ee1a-14fd-be4e-3cc5-bb023c56024e"
  }, [
    'Content-Type',
    'application/json',
    'Date',
    'Tue, 01 Nov 2016 05:04:04 GMT',
    'Content-Length',
    '159',
    'Connection',
    'close'
  ]);

nock('http://vault:8200', {"encodedQueryParams": true})
  .get('/v1/sys/mounts')
  .reply(200, {
    "secret/": {
      "config": {
        "default_lease_ttl": 0, "max_lease_ttl": 0
      },
      "description": "generic secret storage",
      "type": "generic"
    },
    "cubbyhole/": {
      "config": {
        "default_lease_ttl": 0, "max_lease_ttl": 0
      },
      "description": "per-token private secret storage",
      "type": "cubbyhole"
    },
    "sys/": {
      "config": {
        "default_lease_ttl": 0, "max_lease_ttl": 0
      },
      "description": "system endpoints used for control, policy and debugging",
      "type": "system"
    },
    "request_id": "93f8c930-6ddf-6165-7989-63c598c14aac",
    "lease_id": "",
    "renewable": false,
    "lease_duration": 0,
    "data": {
      "cubbyhole/": {
        "config": {
          "default_lease_ttl": 0, "max_lease_ttl": 0
        },
        "description": "per-token private secret storage",
        "type": "cubbyhole"
      },
      "secret/": {
        "config": {
          "default_lease_ttl": 0, "max_lease_ttl": 0
        },
        "description": "generic secret storage",
        "type": "generic"
      },
      "sys/": {
        "config": {
          "default_lease_ttl": 0, "max_lease_ttl": 0
        },
        "description": "system endpoints used for control, policy and debugging",
        "type": "system"
      }
    },
    "wrap_info": null,
    "warnings": null,
    "auth": null
  }, [
    'Content-Type',
    'application/json',
    'Date',
    'Tue, 01 Nov 2016 05:04:04 GMT',
    'Content-Length',
    '961',
    'Connection',
    'close'
  ]);

nock('http://vault:8200', {"encodedQueryParams": true})
  .get('/v1/sys/auth')
  .reply(200, {
    "token/": {
      "config": {
        "default_lease_ttl": 0,
        "max_lease_ttl": 0
      },
      "description": "token based credentials",
      "type": "token"
    },
    "request_id": "ad9b37e3-7963-3848-95b3-7915d8504202",
    "lease_id": "",
    "renewable": false,
    "lease_duration": 0,
    "data": {
      "token/": {
        "config": {
          "default_lease_ttl": 0, "max_lease_ttl": 0
        },
        "description": "token based credentials",
        "type": "token"
      }
    },
    "wrap_info": null,
    "warnings": null,
    "auth": null
  }, [
    'Content-Type',
    'application/json',
    'Date',
    'Tue, 01 Nov 2016 05:04:04 GMT',
    'Content-Length',
    '393',
    'Connection',
    'close'
  ]);

nock('http://vault:8200', {"encodedQueryParams": true})
  .put('/v1/secret/abcd/integration', {
    "integration_info": {
      "name": "integration", "auth": {"type": "basic_auth"}
    },
    "user_info": {
      "id": "abcd"
    },
    "secrets": {"token": "YWRtaW46YWRtaW4="}
  })
  .reply(204, "", ['Content-Type',
    'application/json',
    'Date',
    'Tue, 01 Nov 2016 04:18:12 GMT',
    'Connection',
    'close']);

nock('http://vault:8200', {"encodedQueryParams": true})
  .get('/v1/secret/abcd/integration')
  .reply(200, {
    "request_id": "c48cf5e1-e9c2-c16d-dfaa-847944584e20",
    "lease_id": "",
    "renewable": false,
    "lease_duration": 2592000,
    "data": {
      "integration_info": {"auth": "auth", "name": "integration"},
      "secrets": {"username": "admin", "password": "admin"},
      "user_info": {"id": "abcd"}
    },
    "wrap_info": null,
    "warnings": null,
    "auth": null
  }, ['Content-Type',
    'application/json',
    'Date',
    'Fri, 11 Nov 2016 14:44:08 GMT',
    'Content-Length',
    '273',
    'Connection',
    'close']);

nock('http://vault:8200', {"encodedQueryParams": true})
  .get('/v1/secret/DoesNotExists/integration')
  .reply(404, {"errors": []}, ['Content-Type',
    'application/json',
    'Date',
    'Fri, 11 Nov 2016 14:45:20 GMT',
    'Content-Length',
    '14',
    'Connection',
    'close']);

nock('http://vault:8200', {"encodedQueryParams": true})
  .get('/v1/secret/abcd/DoesNotExists')
  .reply(404, {"errors": []}, ['Content-Type',
    'application/json',
    'Date',
    'Fri, 11 Nov 2016 14:45:20 GMT',
    'Content-Length',
    '14',
    'Connection',
    'close']);

nock('http://basicauth', {"encodedQueryParams": true})
  .get('/success')
  .reply(200, {"authenticated": true, "user": "admin"}, ['Server',
    'nginx',
    'Date',
    'Sat, 12 Nov 2016 03:10:08 GMT',
    'Content-Type',
    'application/json',
    'Content-Length',
    '48',
    'Connection',
    'close',
    'Access-Control-Allow-Origin',
    '*',
    'Access-Control-Allow-Credentials',
    'true']);

nock('http://basicauth', {"encodedQueryParams": true})
  .get('/failure')
  .reply(401, {"authenticated": true, "user": "admin"}, ['Server',
    'nginx',
    'Date',
    'Sat, 12 Nov 2016 03:10:08 GMT',
    'Content-Type',
    'application/json',
    'Content-Length',
    '48',
    'Connection',
    'close',
    'Access-Control-Allow-Origin',
    '*',
    'Access-Control-Allow-Credentials',
    'true']);

nock('http://vault:8200', {"encodedQueryParams": true})
  .put('/v1/secret/abcd/integration', {
    "integration_info": {
      "name": "integration",
      "auth": {
        "type": "basic_auth",
        "params": {
          "endpoint": {
            url: "http://basicauth/success",
            verb: "GET"
          }
        }
      }
    },
    "user_info": {
      "id": "abcd"
    },
    "secrets": {
      "token": "YWRtaW46YWRtaW4="
    }
  })
  .reply(204, "", ['Content-Type',
    'application/json',
    'Date',
    'Sat, 12 Nov 2016 03:10:08 GMT',
    'Connection',
    'close']);

const authService = require('../server.es6');
const request = require('supertest')(authService.app);

/* eslint-disable no-undef */

let token = "";
let secret = "";
let secretPayload = {"username": "admin", "password": "admin"};

describe('Auth Service tests', function() {
  this.timeout(20000);

  before(function(done) {
    let secretsPubKey = fs.readFileSync('./test/assets/jwe_secrets_pub_assets.pem');

    encryptUtil.encryptWithKey(secretsPubKey, JSON.stringify(secretPayload),
      (err, encryptedSecrets) => {
        if (err)
          return done(err);
        secret = encryptedSecrets;
        done();
      });
  });

  it('should fail to yield token if fields are not properly set', function(done) {
    request
      .post('/token_urls')
      .send({})
      .expect(500, done);
  });
  it('should fail to yield token if url_props is not set', function(done) {
    request
      .post('/token_urls')
      .send({
        "user_info": {"id": "abcd"},
        "integration_info": {"name": "integration", "auth": "auth"},
        "bot_info": "xyz"
      })
      .expect(500, done);
  });
  it('should fail to yield token if bot_info is not set', function(done) {
    request
      .post('/token_urls')
      .send({
        "user_info": {"id": "abcd"},
        "integration_info": {"name": "integration", "auth": "auth"},
        "url_props": {"ttl": 300}
      })
      .expect(500, done);
  });
  it('should fail to yield token if integration_info is not set', function(done) {
    request
      .post('/token_urls')
      .send({
        "user_info": {"id": "abcd"},
        "bot_info": "xyz",
        "url_props": {"ttl": 300}
      })
      .expect(500, done);
  });
  it('should fail to yield token if user_info is not set', function(done) {
    request
      .post('/token_urls')
      .send({
        "integration_info": {"name": "integration", "auth": "auth"},
        "bot_info": "xyz",
        "url_props": {"ttl": 300}
      })
      .expect(500, done);
  });
  it('should fail to yield token if integration_info.name is not set', function(done) {
    request
      .post('/token_urls')
      .send({
        "integration_info": {"auth": "auth"},
        "bot_info": "xyz",
        "url_props": {"ttl": 300}
      })
      .expect(500, done);
  });
  it('should fail to yield token if integration_info.auth is not set', function(done) {
    request
      .post('/token_urls')
      .send({
        "integration_info": {"name": "integration"},
        "bot_info": "xyz",
        "url_props": {"ttl": 300}
      })
      .expect(500, done);
  });
  it('should yield valid token if body is correctly built', function(done) {
    let payload = {
      "user_info": {
        "id": "abcd"
      },
      "integration_info": {
        "name": "integration",
        "auth": {"type": "basic_auth"}
      },
      "bot_info": "xyz",
      "url_props": {
        "ttl": 300
      }
    };
    request
      .post('/token_urls')
      .send(payload)
      .expect(201)
      .expect(res => {
        expect(res.body).exists;
        expect(res.body.token).exists;
        expect(res.body.message).equals('token_url created');
        token = res.body.token;
      })
      .end(err => {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('should return an error when posting secrets without providing a token or secret', function(done) {
    request
      .post('/secrets')
      .send({})
      .expect(500, done);
  });
  it('should return an error when posting secrets without providing a valid token', function(done) {
    request
      .post('/secrets')
      .send({"secrets": secret})
      .expect(500, done);
  });
  it('should return an error when posting secrets without providing a valid secret', function(done) {
    request
      .post('/secrets')
      .send({"secrets": {"invalid": "secret"}, "token": token})
      .expect(500, done);
  });
  it('should store the secret given a valid token and secret', function(done) {
    request
      .post('/secrets')
      .send({"secrets": secret, "token": token})
      .expect(201, done);
  });

  it('should be able to retrieve the stored secret', function(done) {
    let userID = 'abcd';
    let integrationName = 'integration';
    request
      .get(`/secrets/${userID}/${integrationName}`)
      .expect(200)
      .expect(resp => {
        expect(resp).to.exist;
        expect(resp.body).to.exist;
        expect(resp.body.secrets).to.exist;
        expect(resp.body.secrets).to.be.an('object');
        expect(resp.body.integration_info).to.exist;
        expect(resp.body.integration_info).to.be.an('object');
        expect(resp.body.integration_info.name).to.exist;
        expect(resp.body.integration_info.auth).to.exist;
        expect(resp.body.user_info).to.exist;
        expect(resp.body.user_info).to.be.an('object');
        expect(resp.body.user_info.id).to.exist;
      })
      .end(done);
  });
  it('should error out when a non-existing userID is given', function(done) {
    let userID = 'DoesNotExists';
    let integrationName = 'integration';
    request
      .get(`/secrets/${userID}/${integrationName}`)
      .expect(404, done);
  });
  it('should error out when a non-existing integrationName is given', function(done) {
    let userID = 'abcd';
    let integrationName = 'DoesNotExists';
    request
      .get(`/secrets/${userID}/${integrationName}`)
      .expect(404, done);
  });
});

describe('Auth Service endpoint authentication test', function() {
  it('should yield valid token with an embedded endpoint (credentials set to admin:admin)', function(done) {
    let payload = {
      "user_info": {
        "id": "abcd"
      },
      "integration_info": {
        "name": "integration",
        "auth": {
          "type": "basic_auth",
          "params": {
            "endpoint": {
              url: "http://basicauth/success",
              verb: "GET"
            }
          }
        }
      },
      "bot_info": "xyz",
      "url_props": {
        "ttl": 300
      }
    };
    request
      .post('/token_urls')
      .send(payload)
      .expect(201)
      .expect(res => {
        expect(res.body).exists;
        expect(res.body.token).exists;
        expect(res.body.message).equals('token_url created');
        token = res.body.token;
      })
      .end(err => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
  it('should store the secret given valid credentials', function(done) {
    request
      .post('/secrets')
      .send({"secrets": secret, "token": token})
      .expect(201, done);
  });
});

describe('Auth Service endpoint authentication test for failure', function() {
  it('should yield valid token with an embedded endpoint (credentials set to admin:newPassword)', function(done) {
    let payload = {
      "user_info": {
        "id": "abcd"
      },
      "integration_info": {
        "name": "integration",
        "auth": {
          "type": "basic_auth",
          "params": {
            "endpoint": {
              url: "http://basicauth/failure",
              verb: "GET"
            }
          }
        }
      },
      "bot_info": "xyz",
      "url_props": {
        "ttl": 300
      }
    };
    request
      .post('/token_urls')
      .send(payload)
      .expect(201)
      .expect(res => {
        expect(res.body).exists;
        expect(res.body.token).exists;
        expect(res.body.message).equals('token_url created');
        token = res.body.token;
      })
      .end(err => {
        if (err) {
          return done(err);
        }
        done();
      });
  });
  it('should not store the secret given invalid credentials', function(done) {
    request
      .post('/secrets')
      .send({"secrets": secret, "token": token})
      .expect(401, done);
  });
  it('should not store the secret if `verb` is not specified', function(done) {
    async.series([
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "basic_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
});

describe('Test IDM authentication', function() {
  it('Should fail if missing endpoint', function(done) {
    async.series([
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing url', function(done) {
    async.series([
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  verb: "GET"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing verb', function(done) {
    async.series([
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing secrets', function(done) {
    request
      .post('/secrets')
      .send({"token": token})
      .expect(500, done);
  });
  it('Should fail if missing user', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "tenant": {
            "username": "admin",
            "password": "admin"
          }
        };

        let secretsPubKey = fs.readFileSync('./test/assets/jwe_secrets_pub_assets.pem');

        encryptUtil.encryptWithKey(secretsPubKey, JSON.stringify(secretPayload),
          (err, encryptedSecrets) => {
            if (err)
              return done(err);
            secret = encryptedSecrets;
            done();
          });
      },
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success",
                  verb: "GET"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing username in user structure', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "user": {
            "password": "admin"
          },
          "tenant": {
            "username": "admin",
            "password": "admin"
          }
        };

        let secretsPubKey = fs.readFileSync('./test/assets/jwe_secrets_pub_assets.pem');

        encryptUtil.encryptWithKey(secretsPubKey, JSON.stringify(secretPayload),
          (err, encryptedSecrets) => {
            if (err)
              return done(err);
            secret = encryptedSecrets;
            done();
          });
      },
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success",
                  verb: "GET"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing password in user structure', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "user": {
            "username": "admin"
          },
          "tenant": {
            "username": "admin",
            "password": "admin"
          }
        };

        let secretsPubKey = fs.readFileSync('./test/assets/jwe_secrets_pub_assets.pem');

        encryptUtil.encryptWithKey(secretsPubKey, JSON.stringify(secretPayload),
          (err, encryptedSecrets) => {
            if (err)
              return done(err);
            secret = encryptedSecrets;
            done();
          });
      },
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success",
                  verb: "GET"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing tenant', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "user": {
            "username": "admin",
            "password": "admin"
          }
        };

        let secretsPubKey = fs.readFileSync('./test/assets/jwe_secrets_pub_assets.pem');

        encryptUtil.encryptWithKey(secretsPubKey, JSON.stringify(secretPayload),
          (err, encryptedSecrets) => {
            if (err)
              return done(err);
            secret = encryptedSecrets;
            done();
          });
      },
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success",
                  verb: "GET"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing username in tenant structure', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "user": {
            "username": "admin",
            "password": "admin"
          },
          "tenant": {
            "password": "admin"
          }
        };

        let secretsPubKey = fs.readFileSync('./test/assets/jwe_secrets_pub_assets.pem');

        encryptUtil.encryptWithKey(secretsPubKey, JSON.stringify(secretPayload),
          (err, encryptedSecrets) => {
            if (err)
              return done(err);
            secret = encryptedSecrets;
            done();
          });
      },
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success",
                  verb: "GET"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
  it('Should fail if missing password in tenant structure', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "user": {
            "username": "admin",
            "password": "admin"
          },
          "tenant": {
            "username": "admin"
          }
        };

        let secretsPubKey = fs.readFileSync('./test/assets/jwe_secrets_pub_assets.pem');

        encryptUtil.encryptWithKey(secretsPubKey, JSON.stringify(secretPayload),
          (err, encryptedSecrets) => {
            if (err)
              return done(err);
            secret = encryptedSecrets;
            done();
          });
      },
      done => {
        let payload = {
          "user_info": {
            "id": "abcd"
          },
          "integration_info": {
            "name": "integration",
            "auth": {
              "type": "idm_auth",
              "params": {
                "endpoint": {
                  url: "http://basicauth/success",
                  verb: "GET"
                }
              }
            }
          },
          "bot_info": "xyz",
          "url_props": {
            "ttl": 300
          }
        };
        request
          .post('/token_urls')
          .send(payload)
          .expect(201)
          .expect(res => {
            expect(res.body).exists;
            expect(res.body.token).exists;
            expect(res.body.message).equals('token_url created');
            token = res.body.token;
          })
          .end(err => {
            if (err) {
              return done(err);
            }
            done();
          });
      }
    ], () => {
      request
        .post('/secrets')
        .send({"secrets": secret, "token": token})
        .expect(500, done);
    });
  });
});
