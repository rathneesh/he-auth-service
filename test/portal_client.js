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

const express = require('express');
const http = require('http');
const portal = require('../app/collector/portal.es6');
const expect = require('chai').expect;
const errors = require('../app/collector/errors.es6');

/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

describe('IdentityPortalClient', () => {
  let getSecrets = () => {
    return [
      {
        secret: "my_secret",
        token: 'my_token'
      }
    ];
  };

  let config = {
    endpoint: 'ws://localhost:<port>'
  };

  // TODO: need to generate mock secrets
  let secrets = getSecrets();
  let server = {};
  let io = {};
  let p = {};

  // Replenish secrets
  before(done => {
    let mainRouter = express();

    mainRouter.get('/', (req, res) => {
      res.send('websocket server online');
    });

    server = http.createServer(mainRouter);

    // TODO: make this port random
    server.listen(0, () => {
      let port = server.address().port.toString();
      config.endpoint = config.endpoint.replace('<port>', port);

      // Use socket-io for websocket communication
      io = require('socket.io')(server);

      io.on('connection', socket => {
        socket.on('collectSecrets', cb => {
          cb(null, secrets);
        });

        socket.on('newToken', (encryptedToken, cb) => {
          cb(null, true);
        });

        socket.on('updateStatus', (token, status, cb) => {
          switch (status) {
            case 'success':
            case 'failed':
              cb(null, true);
              return;
            default:
              cb('Error: status received is not supported', null);
              return;
          }
        });
        // Ensure all socket-io listeners are up
        done();
      });
      p = new portal.IdentityPortal(config);
    });
  });

  beforeEach(done => {
    secrets = getSecrets();
    done();
  });

  it('should fail if config is not ok', done => {
    try {
      let shouldNotWork = new portal.IdentityPortal(undefined);
      shouldNotWork.configOk();
    } catch (e) {
      expect(e).to.be.an('error');
      expect(e).to.equal(errors.noConfigError);
      return done();
    }
    done('Portal did not fail instantiation');
  });

  it('should fail if config is missing endpoint', done => {
    try {
      let shouldNotWork = new portal.IdentityPortal({});
      shouldNotWork.configOk();
    } catch (e) {
      expect(e).to.be.an('error');
      expect(e).to.equal(errors.missingConfigParam);
      return done();
    }
    done('Portal did not fail instantiation');
  });

  // TODO: investigate how to test when socket.io is not connected yet.
  it('should be connected', () => {
    expect(p.connected()).to.equal(true);
  });

  it('should collect secrets from portal', done => {
    expect(p.collectSecrets(done));
  });

  it('should fail collecting empty secrets payload', done => {
    secrets = [];
    expect(p.collectSecrets(err => {
      if (err) {
        done();
      } else done(new Error('No error passed in callback'));
    }));
  });

  it('should update auth success status', done => {
    expect(p.updateStatus(secrets.pop().token, "success", done));
  });

  it('should update auth failed status', done => {
    expect(p.updateStatus(secrets.pop().token, "failed", done));
  });

  it('should fail update with unsupported status', done => {
    expect(p.updateStatus(secrets.pop().token, "G@RB@G3", (err, resp) => {
      expect(err).to.exist;
      done();
    }));
  });

  it('should send new tokens in queue', done => {
    expect(p.saveToken(secrets.pop().token, done));
  });

  after(() => {
    p.io.disconnect();
    io.close();
    server.close();
  });
});
