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

nock('http://vault:8200', {"encodedQueryParams": true})
  .put('/v1/secret/abcd/integration', {
    "integration_info": {
      "name": "integration",
      "auth": {
        "type": "idm_auth",
        "params": {
          "endpoint": {
            url: "http:\/\/idmauth\/success",
            verb: "GET"
          }
        }
      }
    },
    "user_info": {
      "id": "abcd"
    },
    "secrets": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXUyJ9.eyJjb20uaHAuY2xvdWQ6cm9sZTpWVUxORVJBQklMSVRZX1BPTElDWV9BVVRIT1JTIjp0cnVlLCJjb20uaHAuY2xvdWQ6cm9sZTpQQVRDSF9QT0xJQ1lfQVVUSE9SUyI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6UEFDS0FHRV9DT05URU5UX0FVVEhPUlMiOnRydWUsImNvbS5ocC5jbG91ZDpyb2xlOkNPTlRST0xfQVVUSE9SUyI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6UkVTT1VSQ0VfQURNSU5JU1RSQVRPUlMiOnRydWUsImlhdCI6MTQ2NDE5NDUxMiwiY29tLmhwLmNsb3VkOnJvbGU6QlVTSU5FU1NfQURNSU5JU1RSQVRPUlMiOnRydWUsImNvbS5ocC5jbG91ZDpyb2xlOkJVU0lORVNTX1NFUlZJQ0VfQVVUSE9SUyI6dHJ1ZSwiZXhwIjoxNDY0MTk2MzEyLCJjb20uaHAuY2xvdWQ6cm9sZTpQT0xJQ1lfQVVUSE9SUyI6dHJ1ZSwicHJuIjoiaXRvY2FkbWluIiwiY29tLmhwLmNsb3VkOnRlbmFudCI6eyJpZCI6IjllY2E0NjY1LWUyMGMtNGFjZi1iYzkwLTEyNDhkYjdlNTIxNyIsIm5hbWUiOiJwdWJsaWMiLCJlbmFibGVkIjp0cnVlfSwicmVmcmVzaF90b2tlbiI6IlNWK3FWL1d1VVVFUDdXcEYrc2xDL0VZZ2Nra2hmZzBOUC9yQ2NnV3o2VW1Cb2NyeUNBdXdaU1Q5TnVnbVJrcGVqdEhFblBPYlNTeEQvRmdkUThzL2czQzVQZ0JldnltMFhiOFJTQjdoRGJaUVdyV09GNm1HSXFRRW9wN1lCL0FyayswaEp6Q0pGdkNMQlAxMFlTRXcvS25RNndXdEc3Z213VU15SmYzK0JrbTVaaDFWaWY0aDYxNjlVS3lHVWlic1NiallaUEdNQ2xMWUl4OVVaMmVHRmlYUzd2R0NGdWtUQTM4ZHdNMGZjS1kwTWZJSk1GTTBHeUg0ejlEdFpOTFJhRTBYek1iRkFhK1dCU3Z6Tnlna0ZGUkczSGVWcFMvbGsydUVpb1huYkFDV29IUVRkWi9qOWthQ281N2JySW9YbGRDUEF6RitDcGQyaG9jVnhnRkRTcFFSOU9nQXo5SXhsR1RXUENnQW1Rd3FRSjFOdTBqRjE2WWJuUE9nNmdVN0g1ZU9taVllZUdScU1JOHR1MWFmdlZrb3p2eXQ5Sml0Ukl5clBuaU5oMkpGUmJsZmJ3RmxvMlR2WnZSMUs0VnhOUnhjV1Z1VGhra1RlcVRkRWJWN2tpOTZiUUVnRStnYzVxS2hyMFJGYUdBR3NXTTBvTUJFTUx3MXl2d1RSaEVLUkdmZC9ySmVMcnBidDRsTmRoSEFxK0MxVTJacjIwNHlqK0wzTWVIbDVNWEt4cFQvWmx5d3dVa3o2Y0tpYkdlWHUwQy9NdUUxSDhzYzJTTjRjTTNwbVlHRm5hOTdGVjRHYW4xLzBLRkdIenVua2QwSjNrMzRxTXdMckV2RXRBb2tsK3M4UFlnT3p5Qng5VGY3NnZ6Nng5V3JkQWUzZFczaEtoWGczNFJRUy8wME1uS3JNdFY1RDZIMFJDa01sVjBJQlorU0hFRm9NS1UzZ0JPSTNYdWcxWWJVeFRMc3l6OXVJMDZ1TXJ2OGhsNGN6WE43U0F4YThRUEpJN0R5TjdXQStOOUZ2bE9WeitWY3g0STVmYzB4VldLWmcyWFVFZE5aZ2N2bllYdHNtYktOa1BoTUlSNnlzUmlCbmtEV1dhcjFQaDA4MmJlMnJkdmJ3QTlDK1JyZjJIclJNZG1GM1EwMHNZL3NOTFNrV25BV1JUemhPTHhzUHc9PSIsImNvbS5ocC5jbG91ZDpyb2xlOlNZU1RFTV9BRE1JTklTVFJBVE9SUyI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6dHJ1ZSI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6Q1ZFX0NPTlRFTlRfQVVUSE9SUyI6dHJ1ZX0.50JqFIqmqNTMta-XvOlxYtq0C5OdrLIQrK0vg-5-Suw",
      "refreshToken": "SV+qV\/WuUUEP7WpF+slC\/EYgckkhfg0NP\/rCcgWz6UmBocryCAuwZST9NugmRkpejtHEnPObSSxD\/FgdQ8s\/g3C5PgBevym0Xb8RSB7hDbZQWrWOF6mGIqQEop7YB\/Ark+0hJzCJFvCLBP10YSEw\/KnQ6wWtG7gmwUMyJf3+Bkm5Zh1Vif4h6169UKyGUibsSbjYZPGMClLYIx9UZ2eGFiXS7vGCFukTA38dwM0fcKY0MfIJMFM0GyH4z9DtZNLRaE0XzMbFAa+WBSvzNygkFFRG3HeVpS\/lk2uEioXnbACWoHQTdZ\/j9kaCo57brIoXldCPAzF+Cpd2hocVxgFDSpQR9OgAz9IxlGTWPCgAmQwqQJ1Nu0jF16YbnPOg6gU7H5eOmiYeeGRqMI8tu1afvVkozvyt9JitRIyrPniNh2JFRblfbwFlo2TvZvR1K4VxNRxcWVuThkkTeqTdEbV7ki96bQEgE+gc5qKhr0RFaGAGsWM0oMBEMLw1yvwTRhEKRGfd\/rJeLrpbt4lNdhHAq+C1U2Zr204yj+L3MeHl5MXKxpT\/ZlywwUkz6cKibGeXu0C\/MuE1H8sc2SN4cM3pmYGFna97FV4Gan1\/0KFGHzunkd0J3k34qMwLrEvEtAokl+s8PYgOzyBx9Tf76vz6x9WrdAe3dW3hKhXg34RQS\/00MnKrMtV5D6H0RCkMlV0IBZ+SHEFoMKU3gBOI3Xug1YbUxTLsyz9uI06uMrv8hl4czXN7SAxa8QPJI7DyN7WA+N9FvlOVz+Vcx4I5fc0xVWKZg2XUEdNZgcvnYXtsmbKNkPhMIR6ysRiBnkDWWar1Ph082be2rdvbwA9C+Rrf2HrRMdmF3Q00sY\/sNLSkWnAWRTzhOLxsPw=="
    }
  })
  .reply(204, "", ['Content-Type',
    'application/json',
    'Date',
    'Sat, 12 Nov 2016 03:10:08 GMT',
    'Connection',
    'close']);

const idmAuthExampleResponse = {
  "refreshToken": "SV+qV/WuUUEP7WpF+slC/EYgckkhfg0NP/rCcgWz6UmBocryCAuwZST9NugmRkpejtHEnPObSSxD/FgdQ8s/g3C5PgBevym0Xb8RSB7hDbZQWrWOF6mGIqQEop7YB/Ark+0hJzCJFvCLBP10YSEw/KnQ6wWtG7gmwUMyJf3+Bkm5Zh1Vif4h6169UKyGUibsSbjYZPGMClLYIx9UZ2eGFiXS7vGCFukTA38dwM0fcKY0MfIJMFM0GyH4z9DtZNLRaE0XzMbFAa+WBSvzNygkFFRG3HeVpS/lk2uEioXnbACWoHQTdZ/j9kaCo57brIoXldCPAzF+Cpd2hocVxgFDSpQR9OgAz9IxlGTWPCgAmQwqQJ1Nu0jF16YbnPOg6gU7H5eOmiYeeGRqMI8tu1afvVkozvyt9JitRIyrPniNh2JFRblfbwFlo2TvZvR1K4VxNRxcWVuThkkTeqTdEbV7ki96bQEgE+gc5qKhr0RFaGAGsWM0oMBEMLw1yvwTRhEKRGfd/rJeLrpbt4lNdhHAq+C1U2Zr204yj+L3MeHl5MXKxpT/ZlywwUkz6cKibGeXu0C/MuE1H8sc2SN4cM3pmYGFna97FV4Gan1/0KFGHzunkd0J3k34qMwLrEvEtAokl+s8PYgOzyBx9Tf76vz6x9WrdAe3dW3hKhXg34RQS/00MnKrMtV5D6H0RCkMlV0IBZ+SHEFoMKU3gBOI3Xug1YbUxTLsyz9uI06uMrv8hl4czXN7SAxa8QPJI7DyN7WA+N9FvlOVz+Vcx4I5fc0xVWKZg2XUEdNZgcvnYXtsmbKNkPhMIR6ysRiBnkDWWar1Ph082be2rdvbwA9C+Rrf2HrRMdmF3Q00sY/sNLSkWnAWRTzhOLxsPw==",
  "token": {
    "expires": "2016-05-25T17:11:52.000Z",
    "id": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXUyJ9.eyJjb20uaHAuY2xvdWQ6cm9sZTpWVUxORVJBQklMSVRZX1BPTElDWV9BVVRIT1JTIjp0cnVlLCJjb20uaHAuY2xvdWQ6cm9sZTpQQVRDSF9QT0xJQ1lfQVVUSE9SUyI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6UEFDS0FHRV9DT05URU5UX0FVVEhPUlMiOnRydWUsImNvbS5ocC5jbG91ZDpyb2xlOkNPTlRST0xfQVVUSE9SUyI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6UkVTT1VSQ0VfQURNSU5JU1RSQVRPUlMiOnRydWUsImlhdCI6MTQ2NDE5NDUxMiwiY29tLmhwLmNsb3VkOnJvbGU6QlVTSU5FU1NfQURNSU5JU1RSQVRPUlMiOnRydWUsImNvbS5ocC5jbG91ZDpyb2xlOkJVU0lORVNTX1NFUlZJQ0VfQVVUSE9SUyI6dHJ1ZSwiZXhwIjoxNDY0MTk2MzEyLCJjb20uaHAuY2xvdWQ6cm9sZTpQT0xJQ1lfQVVUSE9SUyI6dHJ1ZSwicHJuIjoiaXRvY2FkbWluIiwiY29tLmhwLmNsb3VkOnRlbmFudCI6eyJpZCI6IjllY2E0NjY1LWUyMGMtNGFjZi1iYzkwLTEyNDhkYjdlNTIxNyIsIm5hbWUiOiJwdWJsaWMiLCJlbmFibGVkIjp0cnVlfSwicmVmcmVzaF90b2tlbiI6IlNWK3FWL1d1VVVFUDdXcEYrc2xDL0VZZ2Nra2hmZzBOUC9yQ2NnV3o2VW1Cb2NyeUNBdXdaU1Q5TnVnbVJrcGVqdEhFblBPYlNTeEQvRmdkUThzL2czQzVQZ0JldnltMFhiOFJTQjdoRGJaUVdyV09GNm1HSXFRRW9wN1lCL0FyayswaEp6Q0pGdkNMQlAxMFlTRXcvS25RNndXdEc3Z213VU15SmYzK0JrbTVaaDFWaWY0aDYxNjlVS3lHVWlic1NiallaUEdNQ2xMWUl4OVVaMmVHRmlYUzd2R0NGdWtUQTM4ZHdNMGZjS1kwTWZJSk1GTTBHeUg0ejlEdFpOTFJhRTBYek1iRkFhK1dCU3Z6Tnlna0ZGUkczSGVWcFMvbGsydUVpb1huYkFDV29IUVRkWi9qOWthQ281N2JySW9YbGRDUEF6RitDcGQyaG9jVnhnRkRTcFFSOU9nQXo5SXhsR1RXUENnQW1Rd3FRSjFOdTBqRjE2WWJuUE9nNmdVN0g1ZU9taVllZUdScU1JOHR1MWFmdlZrb3p2eXQ5Sml0Ukl5clBuaU5oMkpGUmJsZmJ3RmxvMlR2WnZSMUs0VnhOUnhjV1Z1VGhra1RlcVRkRWJWN2tpOTZiUUVnRStnYzVxS2hyMFJGYUdBR3NXTTBvTUJFTUx3MXl2d1RSaEVLUkdmZC9ySmVMcnBidDRsTmRoSEFxK0MxVTJacjIwNHlqK0wzTWVIbDVNWEt4cFQvWmx5d3dVa3o2Y0tpYkdlWHUwQy9NdUUxSDhzYzJTTjRjTTNwbVlHRm5hOTdGVjRHYW4xLzBLRkdIenVua2QwSjNrMzRxTXdMckV2RXRBb2tsK3M4UFlnT3p5Qng5VGY3NnZ6Nng5V3JkQWUzZFczaEtoWGczNFJRUy8wME1uS3JNdFY1RDZIMFJDa01sVjBJQlorU0hFRm9NS1UzZ0JPSTNYdWcxWWJVeFRMc3l6OXVJMDZ1TXJ2OGhsNGN6WE43U0F4YThRUEpJN0R5TjdXQStOOUZ2bE9WeitWY3g0STVmYzB4VldLWmcyWFVFZE5aZ2N2bllYdHNtYktOa1BoTUlSNnlzUmlCbmtEV1dhcjFQaDA4MmJlMnJkdmJ3QTlDK1JyZjJIclJNZG1GM1EwMHNZL3NOTFNrV25BV1JUemhPTHhzUHc9PSIsImNvbS5ocC5jbG91ZDpyb2xlOlNZU1RFTV9BRE1JTklTVFJBVE9SUyI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6dHJ1ZSI6dHJ1ZSwiY29tLmhwLmNsb3VkOnJvbGU6Q1ZFX0NPTlRFTlRfQVVUSE9SUyI6dHJ1ZX0.50JqFIqmqNTMta-XvOlxYtq0C5OdrLIQrK0vg-5-Suw",
    "issued_at": "2016-05-25T16:41:52.375Z",
    "tenant": {
      "enabled": true,
      "id": "9eca4665-e20c-4acf-bc90-1248db7e5217",
      "name": "public"
    }
  },
  "user": {
    "id": "b60f3445-d1ce-4a3a-8db4-47eb87c987d4",
    "name": "itocadmin",
    "roles": [
      {
        "id": "10c66f16-b36a-4377-ba39-a67336a53f55",
        "name": "BUSINESS_ADMINISTRATORS"
      },
      {
        "id": "487ee85e-e2b4-4f88-a60b-705af78fdcfc",
        "name": "BUSINESS_SERVICE_AUTHORS"
      },
      {
        "id": "70fcf513-da73-4493-b938-14b84c3426cd",
        "name": "CONTROL_AUTHORS"
      },
      {
        "id": "99fbb38e-ba01-4458-b0be-1e2d900ac926",
        "name": "CVE_CONTENT_AUTHORS"
      },
      {
        "id": "502fd9fa-f037-4167-88e5-4f4118eb757c",
        "name": "PACKAGE_CONTENT_AUTHORS"
      },
      {
        "id": "f42fd36e-fe10-45ad-b7bf-a3a498b9b2bb",
        "name": "PATCH_POLICY_AUTHORS"
      },
      {
        "id": "dcaae23e-6b7e-47cc-80c1-0a2403ca7afe",
        "name": "POLICY_AUTHORS"
      },
      {
        "id": "1ff86555-adf7-4f83-8c25-64fb0eb157bf",
        "name": "RESOURCE_ADMINISTRATORS"
      },
      {
        "id": "fc0cabdb-8ae5-43fd-bd60-b34d92626191",
        "name": "SYSTEM_ADMINISTRATORS"
      },
      {
        "id": "b1f49102-1ff7-4116-b71d-92c348a044f9",
        "name": "VULNERABILITY_POLICY_AUTHORS"
      },
      {
        "id": "167ee8cc-6c5c-4465-a0d5-63ab9ff9e783",
        "name": "true"
      }
    ]
  }
}

nock('http://idmauth', {"encodedQueryParams": true})
  .get('/success')
  .reply(200, idmAuthExampleResponse, ['Server',
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

nock('http://idmauth', {"encodedQueryParams": true})
  .get('/failure')
  .reply(401, idmAuthExampleResponse, ['Server',
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
  it('Should successfuly authenticate when payload is built correctly.', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "user": {
            "username": "admin",
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
                  url: "http://idmauth/success",
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
        .expect(201, done);
    });
  });
  it('Should not allow access to an agent with incorrect credentials.', function(done) {
    async.series([
      done => {
        let secretPayload = {
          "user": {
            "username": "admin",
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
                  url: "http://idmauth/failure",
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
        .expect(401, done);
    });
  });
});
