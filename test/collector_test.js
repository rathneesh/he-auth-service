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
