const express = require('express');
const https = require('https');
const fs = require('fs');
const config = require('nconf');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const log = require('winston');
const helmet = require('helmet');
const expressValidator = require('express-validator');
const tokenRoute = require('./app/routes/token_urls.es6');
const secretsRoute = require('./app/routes/secrets.es6');
const Vaulted = require('vaulted');
const collector = require('./app/collector/collector.es6');

/* eslint-disable camelcase */

// Set configuration hierarchy
config.argv()
  .env();

try {
  // Set required environment variables.
  config.required([
    'HE_AUTH_SSL_PASS',
    'HE_IDENTITY_PORTAL_ENDPOINT',
    'HE_IDENTITY_WS_ENDPOINT',
    'VAULT_DEV_ROOT_TOKEN_ID',
    'HE_ISSUER',
    'HE_AUDIENCE'
  ]);
} catch (err) {
  // Exit if not present.
  console.log(err.message);
  process.exit(1);
}

// default port for API
const DEFAULT_PORT = 3000;

// Load express
let app = express();

// Connect to vault
let myVault = new Vaulted({
  vault_host: config.get("HE_VAULT_HOST") || 'vault',
  vault_port: config.get("HE_VAULT_PORT") || 8200,
  vault_ssl: false,
  vault_token: config.get("VAULT_DEV_ROOT_TOKEN_ID")
});

myVault.prepare()
  .then(() => {
    console.log('Vault is now ready!');
  });

// Secret for creating and verifying jwts
app.set('jwt_issuer', config.get("HE_ISSUER"));

// Secret for creating and verifying jwts
app.set('jwt_audience', config.get("HE_AUDIENCE"));

// Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
app.use(helmet());
app.use(morgan('combined'));

// Parse application/json
app.use(bodyParser.json());

// Validate posts
app.use(expressValidator());

// Secrets API
app.post('/secrets', secretsRoute.authenticateSecrets);
app.get('/secrets/:userId/:integrationName', secretsRoute.readSecrets);

// Token_urls API
app.post('/token_urls', tokenRoute.createToken);
app.delete('/token_urls/:token', tokenRoute.deleteToken);

// Start collector
let selfSignedValue = config.get("HE_AUTH_SSL_SELF_SIGNED");
let collectorConfig = {
  portalEndpoint: `${config.get("HE_IDENTITY_WS_ENDPOINT")}`,
  authServiceEndpoint: 'https://localhost:' + DEFAULT_PORT,
  secretCollectionInterval: 3000,
  tokenCollectionInterval: 3000,
  selfSignedCerts: selfSignedValue === 'true' || selfSignedValue === 'TRUE'
};

console.log(collectorConfig);

let c = new collector.Collector(collectorConfig);
c.start((err, resp) => {
  if (err) {
    return log.error("An error occurred while starting " +
      "the collector. " + err.toString());
  }
  log.info("Collector is up and running.");
});

let privateKey;
let certificate;
let passphrase;

try {
  privateKey = fs.readFileSync('./certs/key.pem', 'utf8');
  certificate = fs.readFileSync('./certs/cert.pem', 'utf8');
  passphrase = config.get("HE_AUTH_SSL_PASS");
} catch (err) {
  log.error("An error occurred while searching " +
    "for `key.pem` and `cert.pem`. " + err.toString());
}

let credentials = {
  key: privateKey,
  cert: certificate,
  passphrase: passphrase
};

let httpsServer = https.createServer(credentials, app);

log.info('Express started on port ' + DEFAULT_PORT);
httpsServer.listen(DEFAULT_PORT);

let keys = {};

try {
  // Decrypt JWE token with private key
  keys.jweTokenUrl = fs.readFileSync('./certs/jwe_token_url.pem');
  // Encrypt JWE with public key
  keys.jweTokenUrlPub = fs.readFileSync('./certs/jwe_token_url_pub.pem');
  // DecryptSecrets with private key
  keys.jweSecretsKey = fs.readFileSync('./certs/jwe_secrets.pem');
  // Sign JWT token with private key
  keys.jwtToken = fs.readFileSync('./certs/jwt_token.pem');
  // JWT public key
  keys.jwtTokenPub = fs.readFileSync('./certs/jwt_token_pub.pem');
} catch (err) {
  log.error("An error occurred while searching " +
    "for JWT/JWE public and private keys. " + err.toString());
}

// Export express app for testing
exports.app = app;
exports.he_identity_portal_endpoint = config.get("HE_IDENTITY_PORTAL_ENDPOINT");
exports.vault = myVault;
exports.keys = keys;
