const expect = require('chai').expect;
let nock = require('nock');
let clientlib = require('../app/client/client_lib.es6');
let _ = require('lodash');

/* eslint-disable camelcase */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-undef */

describe('Test AuthServiceClient', () => {
  const config = {
    endpoint: 'https://localhost/'
  };
  const PORTAL_URI = 'http://identity/portal';
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
    'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.' +
    'TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ';

  const okTokenUrlResponse = {
    message: 'token_url created',
    token: token,
    url: PORTAL_URI + '/' + token
  };

  const okTokenUrlRequest = {
    userInfo: {
      id: 'wookie@kashyyyk.com'
    },
    integrationInfo: {
      name: 'starwars_integration',
      auth: {
        type: 'basic_auth'
      }
    },
    urlProps: {
      ttl: '5000'
    },
    botInfo: {}
  };

  let okSecretsResponse = {
    user_info: okTokenUrlRequest.userInfo,
    integration_info: okTokenUrlRequest.integrationInfo,
    secrets: {
      token: 'cmljYXJkbzpteXBhc3M='
    }
  };

  let okSecretRequest = _.omit(okSecretsResponse, 'user_info');
  okSecretRequest = _.omit(okSecretRequest, 'integration_info');
  okSecretRequest.token = token;

  let authClient = new clientlib.AuthServiceClient(config);

  afterEach(() => {
    nock.cleanAll();
  });

  describe('generateTokenUrl()', () => {
    // TODO: error scenarios for return codes
    // TODO: error scenarios with malformed responses

    it('Should create a token_url with a valid request', done => {
      nock(config.endpoint)
        .post('/token_urls')
        .reply(201, okTokenUrlResponse);

      authClient.generateTokenUrl(okTokenUrlRequest, (err, resp) => {
        if (err) {
          done(err);
        } else {
          expect(resp).deep.equal(okTokenUrlResponse);
          done();
        }
      });
    });

    it('Should fail with malformed userInfo in request', done => {
      const tokenUrlRequestMalformedUser =
        _.omit(okTokenUrlRequest, ['userInfo']);
      authClient.generateTokenUrl(tokenUrlRequestMalformedUser, (err, resp) => {
        if (err && _.includes(err.toString(), clientlib.MALFORMED_REQUEST)) {
          done();
        } else {
          done(new Error(String(resp)));
        }
      });
    });

    it('Should fail with malformed integrationInfo in request', done => {
      const tokenUrlRequestMalformedIntegration =
        _.omit(okTokenUrlRequest, ['integrationInfo']);
      authClient.generateTokenUrl(tokenUrlRequestMalformedIntegration,
        (err, resp) => {
          if (err && _.includes(err.toString(), clientlib.MALFORMED_REQUEST)) {
            done();
          } else {
            done(new Error(String(resp)));
          }
        });
    });

    it('Should fail with malformed url props in request', done => {
      const tokenUrlRequestMalformedUrlProps =
        _.omit(okTokenUrlRequest, ['urlProps']);
      authClient.generateTokenUrl(tokenUrlRequestMalformedUrlProps,
        (err, resp) => {
          if (err && _.includes(err.toString(), clientlib.MALFORMED_REQUEST)) {
            done();
          } else {
            done(new Error(String(resp)));
          }
        });
    });
  });

  describe('authenticated() / getSecrets()', () => {
    it('Should get secrets for a user + integration', done => {
      let userName = okTokenUrlRequest.userInfo.id;
      let integrationName = okTokenUrlRequest.integrationInfo.name;
      let path = authClient.getSecretsPath(userName, integrationName);
      nock(config.endpoint)
        .get(path)
        .reply(200, okSecretsResponse);
      authClient.authenticated(userName, integrationName, (err, resp) => {
        if (err) {
          if (resp) {
            err = new Error(err + '\n' + JSON.stringify(resp));
          }
          done(err);
        } else {
          expect(resp.secrets).deep.equal(okSecretsResponse.secrets);
          done();
        }
      });
    });

    it('Should fail if invalid integration_info structure in response',
      done => {
        let userName = okTokenUrlRequest.userInfo.id;
        let integrationName = okTokenUrlRequest.integrationInfo.name;
        let path = authClient.getSecretsPath(userName, integrationName);
        let notOkResponse = _.omit(okSecretsResponse, 'integration_info');
        nock(config.endpoint)
          .get(path)
          .reply(200, notOkResponse);
        authClient.authenticated(userName, integrationName, (err, resp) => {
          if (err && _.includes(err.toString(), clientlib.MALFORMED_RESPONSE)) {
            done();
          } else {
            if (resp) {
              err = new Error(err + '\n' + JSON.stringify(resp));
            }
            done(err);
          }
        });
      });

    it('Should fail if invalid user_info structure in response', done => {
      let userName = okTokenUrlRequest.userInfo.id;
      let integrationName = okTokenUrlRequest.integrationInfo.name;
      let path = authClient.getSecretsPath(userName, integrationName);
      let notOkResponse = _.omit(okSecretsResponse, 'user_info');
      nock(config.endpoint)
        .get(path)
        .reply(200, notOkResponse);
      authClient.authenticated(userName, integrationName, (err, resp) => {
        if (err && _.includes(err.toString(), clientlib.MALFORMED_RESPONSE)) {
          done();
        } else {
          if (resp) {
            err = new Error(err + '\n' + JSON.stringify(resp));
          }
          done(err);
        }
      });
    });

    it('Should fail if invalid user_info structure in response', done => {
      let userName = okTokenUrlRequest.userInfo.id;
      let integrationName = okTokenUrlRequest.integrationInfo.name;
      let path = authClient.getSecretsPath(userName, integrationName);
      let notOkResponse = _.omit(okSecretsResponse, 'user_info');
      nock(config.endpoint)
        .get(path)
        .reply(200, notOkResponse);
      authClient.authenticated(userName, integrationName, (err, resp) => {
        if (err && _.includes(err.toString(), clientlib.MALFORMED_RESPONSE)) {
          done();
        } else {
          if (resp) {
            err = new Error(err + '\n' + JSON.stringify(resp));
          }
          done(err);
        }
      });
    });

    it('Should fail if secrets not found', done => {
      let userName = okTokenUrlRequest.userInfo.id;
      let integrationName = okTokenUrlRequest.integrationInfo.name;
      let path = authClient.getSecretsPath(userName, integrationName);
      let secretMessageResponse = {
        message: 'Error retrieving secrets at ' + path
      };

      nock(config.endpoint)
        .get(path)
        .reply(404, secretMessageResponse);
      authClient.authenticated(userName, integrationName, (err, resp) => {
        expect(err).to.exist;
        expect(err).to.be.a('error');
        expect(resp).to.exist;
        expect(resp).deep.equal(secretMessageResponse);
        done();
      });
    });

    it('Should fail if secrets there is an error in the server', done => {
      let userName = okTokenUrlRequest.userInfo.id;
      let integrationName = okTokenUrlRequest.integrationInfo.name;
      let path = authClient.getSecretsPath(userName, integrationName);
      let secretMessageResponse = {
        message: 'There was an internal server error while ' +
        'retrieving secrets at' + path
      };

      nock(config.endpoint)
        .get(path)
        .reply(500, secretMessageResponse);
      authClient.authenticated(userName, integrationName, (err, resp) => {
        expect(err).to.exist;
        expect(err).to.be.a('error');
        expect(resp).to.exist;
        expect(resp).deep.equal(secretMessageResponse);
        done();
      });
    });
  });

  describe('saveSecrets()', () => {
    it('Should create a new secret', done => {
      let secretMessageResponse = {
        message: 'Successfully saved secrets'
      };

      nock(config.endpoint)
        .post('/secrets')
        .reply(201, secretMessageResponse);

      authClient.saveSecrets(okSecretRequest, (err, resp) => {
        if (err) {
          done(err);
        } else {
          expect(resp).deep.equal(secretMessageResponse);
          done();
        }
      });
    });

    it('Should handle error in server when creating secret', done => {
      let path = '/secrets';
      let secretMessageResponse = {
        message: 'There was an internal server error while retrieving ' +
        'secrets at' + path
      };

      let expectedError = new Error(clientlib.UNEXPECTED_STATUS_CODE + '500')
        .toString();
      nock(config.endpoint)
        .post(path)
        .reply(500, secretMessageResponse);

      // TODO: this might break if we use with an actual server since it uses an ok request
      authClient.saveSecrets(okSecretRequest, (err, resp) => {
        expect(err).to.exist;
        expect(err).to.be.a('error');
        expect(err.toString()).to.equal(expectedError);
        expect(resp).to.exist;
        expect(resp).deep.equal(secretMessageResponse);
        done();
      });
    });

    it('Should handle malformed request with no secret', done => {
      let notOkParams = _.omit(okSecretRequest, 'secrets');
      let expectedError = new Error(clientlib.MALFORMED_REQUEST + ': secrets')
        .toString();
      // TODO: this might break if we use with an actual server since it uses an ok request
      authClient.saveSecrets(notOkParams, err => {
        expect(err).to.exist;
        expect(err).to.be.a('error');
        expect(err.toString()).to.equal(expectedError);
        done();
      });
    });

    it('Should handle malformed request with no token', done => {
      let notOkParams = _.omit(okSecretRequest, 'token');
      let expectedError = new Error(clientlib.MALFORMED_REQUEST + ': token')
        .toString();
      // TODO: this might break if we use with an actual server since it uses an ok request
      authClient.saveSecrets(notOkParams, err => {
        expect(err).to.exist;
        expect(err).to.be.a('error');
        expect(err.toString()).to.equal(expectedError);
        done();
      });
    });
  });
});
