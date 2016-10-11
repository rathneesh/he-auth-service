const express = require('express');
const http = require('http');

//const heCollector = require('../app/collector/collector.es6');
const portal = require('../app/collector/portal.es6');
const expect = require('chai').expect;
const collector = require('../app/collector/collector.es6');

//let app  = require('../server.es6').app;

describe('IdentityPortalClient', () => {
  let config = {
    endpoint: 'ws://localhost:3030'
  };

  let p = new portal.IdentityPortal(config);

  // TODO: need to generate mock secrets
  let secrets = [{'secret': "my_secret", 'token': 'my_token'}];


  let mainRouter = express();

  mainRouter.get('/', (req, res) => {
    console.log('express + ws server');
    res.send('websocket server online');
  });

  let server = http.createServer(mainRouter);

  // TODO: make this port random
  server.listen(3030, () => {
    console.log('Running ws server at localhost:' + server.address().port);
  });

  // Use socket-io for websocket communication
  let io = require('socket.io')(server);

  io.on('connection', socket => {
    console.log('a client was connected');
    socket.on('collectSecrets', cb => {
      console.log('Collecting secrets');
      cb(null, secrets);
    });

    socket.on('newToken', (encryptedToken, cb) => {
      console.log('Adding new token');
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

  // Replenish secrets
  beforeEach(() => {
    secrets = [{'secret': "my_secret", 'token': 'my_token'}];
  });

  it('should collect secrets from portal', (done) => {
    expect(p.collectSecrets(done));
  });

  it('should fail collecting empty secrets payload', (done) => {
    secrets = [];
    expect(p.collectSecrets((err, resp) => {
      if (err) {
        done();
      } else done(new Error('No error passed in callback'));
    }));
  });

  //it('should save many secrets to auth service', (done) => {
  //  expect(p.saveSecrets(secrets, done));
  //});
  //
  //it('should save one secret to auth service', (done) => {
  //  secrets.push({'secret': "my_secret", 'token': 'my_token'});
  //  expect(p.saveSecret(secrets.pop(), done));
  //});

  it('should update auth success status', (done) => {
    expect(p.updateStatus(secrets.pop().token, "success", done));
  });

  it('should update auth failed status', (done) => {
    expect(p.updateStatus(secrets.pop().token, "failed", done));
  });

  it('should fail update with unsupported status', (done) => {
    expect(p.updateStatus(secrets.pop().token, "G@RB@G3", (err, resp) => {
      console.log(err);
      expect(err).to.exist;
      done();
    }));
  });

  it('should send new tokens in queue', (done) => {
    expect(p.saveToken(secrets.pop().token, done));
  });

  after(() => {
    p.io.disconnect();
    io.close();
    server.close();
  });
});

describe('HeCollector', () => {
  let config = {
    portalEndpoint: 'ws://localhost:3030',
    authServiceEndpoint: 'https://localhost:3000',
    datastoreEndpoint: 'redis://localhost:6379',
    secretCollectionInterval: 300,
    tokenCollectionInterval: 300
  };

  let c = {};
  let server = {};
  let io = {};

  // TODO: need to generate mock secrets
  let secrets = [{'secret': "my_secret", 'token': 'my_token'}];

  before(() => {

    let mainRouter = express();

    mainRouter.get('/', (req, res) => {
      console.log('express + ws server');
      res.send('websocket server online');
    });

    server = http.createServer(mainRouter);
    // TODO: make this port random
    server.listen(3030, () => {
      console.log('Running ws server at localhost:' + server.address().port);
    });

    // Use socket-io for websocket communication
    io = require('socket.io')(server);

    io.on('connection', socket => {
      console.log('a client was connected');
      socket.on('collectSecrets', cb => {
        console.log('Collecting secrets');
        cb(null, secrets);
      });

      socket.on('newToken', (encryptedToken, cb) => {
        console.log('Adding new token');
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
    c = new collector.Collector(config)
  });

  // Replenish secrets
  beforeEach(() => {
    secrets = [{'secret': "my_secret", 'token': 'my_token'}];
  });

  it('should start and stop collector', (done) => {
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


