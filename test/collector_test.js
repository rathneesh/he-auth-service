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
const expect = require('chai').expect;
const collector = require('../app/collector/collector.es6');

/* eslint-disable no-undef */
/* eslint-disable no-unused-expressions */

describe('HeCollector', () => {
  // TODO: refactor and export this utility func
  let getSecrets = () => {
    return [
      {
        secret: "my_secret",
        token: 'my_token'
      }
    ];
  };

  let config = {
    portalEndpoint: 'ws://localhost:<port>',
    authServiceEndpoint: 'https://localhost:3000',
    datastoreEndpoint: 'redis://localhost:6379',
    secretCollectionInterval: 300,
    tokenCollectionInterval: 300
  };

  let c = {};
  let server = {};
  let io = {};

  // TODO: need to generate mock secrets
  let secrets = getSecrets();

  before(() => {
    let mainRouter = express();

    mainRouter.get('/', (req, res) => {
      res.send('websocket server online');
    });

    server = http.createServer(mainRouter);
    // TODO: make this port random
    server.listen(0, () => {
      let port = server.address().port.toString();
      console.log('Running ws server at localhost:' + port);

      config.portalEndpoint = config.portalEndpoint.replace('<port>', port);

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
      });
      c = new collector.Collector(config);
    });
  });

  // Replenish secrets
  beforeEach(() => {
    secrets = getSecrets();
  });

  it('should start and stop collector', done => {
    c.start((err, resp) => {
      if (err) {
        done(err);
      } else {
        expect(resp).to.equal('ok');
        expect(c.running()).to.equal(true);
        c.stop((err, resp) => {
          if (err) {
            done(err);
          } else {
            expect(resp).to.equal('ok');
            done();
          }
        });
      }
    });
  });

  after(() => {
    c.disconnect(() => {
      io.close();
      server.close();
    });
  });
});
