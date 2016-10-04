let express = require('express');
let https = require('https');
let fs = require('fs');
let config = require('nconf');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let log = require('winston');
let helmet = require('helmet');
let expressValidator = require('express-validator');
let stringsResource = require('./app/resources/strings.es6');
let tokenRoute = require('./app/routes/token_urls.es6');
let secretsRoute = require('./app/routes/secrets.es6');
var Vaulted = require('vaulted');

// Set configuration hierarchy
config.argv()
    .env();

try {
    // Set required environment variables.
    config.required([
        'HE_AUTH_JWT_SECRET',
        'HE_AUTH_SSL_PASS',
        'MONGO',
        'HE_IDENTITY_PORTAL_ENDPOINT',
        'VAULT_DEV_ROOT_TOKEN_ID'
    ]);
} catch (err) {
    // Exit if not present.
    console.log(err.message);
    process.exit(1);
}


// Load express
let app = express();

// Connect to vault
let myVault = new Vaulted({
  vault_host: config.get("HE_VAULT_ENDPOINT") || 'vault',
  vault_port: 8200,
  vault_ssl: false,
  vault_token: config.get("VAULT_DEV_ROOT_TOKEN_ID")
});

myVault.prepare()
  .then(function () {
    console.log('Vault is now ready!');
  });

// Secret for creating and verifying jwts
app.set('jwt_secret',  config.get("HE_AUTH_JWT_SECRET"));

// Secret for creating and verifying jwts
app.set('jwt_issuer', config.get("HE_AUTH_SERVICE_ISSUER") || stringsResource.DEFAULT_ISSUER);

// Secret for creating and verifying jwts
app.set('jwt_audience', config.get("HE_AUTH_SERVICE_ISSUER") || stringsResource.DEFAULT_AUDIENCE);

// Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
app.use(helmet());
app.use(morgan('combined'));

// Parse application/json
app.use(bodyParser.json());

// Validate posts
app.use(expressValidator());

app.post('/secrets', secretsRoute.authenticateSecrets);
app.put('/secrets/:userId/:integrationName', secretsRoute.updateSecrets);
app.get('/secrets/:userId/:integrationName', secretsRoute.readSecrets);
app.delete('/secrets/:userId/:integrationName', secretsRoute.deleteSecrets);

app.post('/token_urls', tokenRoute.createToken);
app.get('/token_urls/:token', tokenRoute.validateToken);
app.delete('/token_urls/:token', tokenRoute.deleteToken);

let privateKey;
let certificate;
let passphrase;

try {
    privateKey  = fs.readFileSync('./key.pem', 'utf8');
    certificate = fs.readFileSync('./cert.pem', 'utf8');
    passphrase = config.get("HE_AUTH_SSL_PASS");
} catch (err) {
    log.info("An error occurred while searching for `key.pem` and `cert.pem`. " + err.toString())
}

let credentials = {
    key: privateKey,
    cert: certificate,
    passphrase: passphrase
};

let httpsServer = https.createServer(credentials, app);

log.info('Express started on port 3000');
httpsServer.listen(3000);

// Export express app for testing
exports.app = app;
exports.he_identity_portal_endpoint = config.get("HE_IDENTITY_PORTAL_ENDPOINT");
exports.vault = myVault;
