const express = require('express');
const http = require('http');

const heCollector = require('../app/collector/collector.es6');
const expect = require('chai').expect;
//let app  = require('../server.es6').app;


// Use BDD extensions

describe('HeCollector', () => {
  let c = null;
  let config = {
    portalEndpoint: 'ws://localhost:3001',
    authServiceEndpoint: 'https://localhost:3000',
    datastoreEndpoint: 'redis://localhost:6379',
    secretCollectionInterval: 300,
    tokenCollectionInterval: 300
  };

  // TODO: need to generate mock secrets
  let secrets = [{'secret': "my_secret", 'token': 'my_token'}];

  before(() => {

    let mainRouter = express();

    mainRouter.get('/', (req, res) => {
      console.log('express + ws server');
      res.send('websocket server online');
    });

    let server = http.createServer(mainRouter);
    server.listen(3001, () => {
      console.log('Running ws server in port 3001');
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
    });

    // Create collector and set it up
    c = new heCollector.Collector(config);
  });

  it('should collect secrets from portal', (done) => {
    expect(c.collectSecrets(done));
  });

  it('should save many secrets to auth service', (done) => {
    expect(c.saveSecrets(secrets, done));
  });

  it('should save one secret to auth service', (done) => {
    secrets.push({'secret': "my_secret", 'token': 'my_token'});
    expect(c.saveSecret(secrets.pop(), done));
  });

  it('should update auth status in portal', (done) => {
    secrets.push({'secret': "my_secret", 'token': 'my_token'});
    expect(c.updateStatus(secrets.pop().token, done));
  });

  it('should send new tokens in queue', (done) => {
    secrets.push({'secret': "my_secret", 'token': 'my_token'});
    expect(c.saveToken(secrets.pop().token, done));
  });

});