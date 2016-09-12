let express = require('express');
let https = require('https');
let fs = require('fs');
let config = require('nconf');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let log = require('winston');
let helmet = require('helmet');
let mongoose = require('mongoose');
let expressValidator = require('express-validator');

let tokenRoute = require('./app/routes/token_urls.es6');

// Set configuration hierarchy
config.argv()
    .env();

// Load express
let app = express();

// Connect to Mongo
mongoose.connect(
    config.get("MONGO") || log.error('MONGO ENDPOINT NOT PROVIDED!') && process.exit(-1)
);

// Secret for creating and verifying jwts
app.set('jwt_secret', 
    config.get("JWT_SECRET") || log.error('JWT_SECRET NOT PROVIDED!') && process.exit(-1)
);

// Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
app.use(helmet());
app.use(morgan('combined'));

// Parse application/json
app.use(bodyParser.json());

// Validate posts
app.use(expressValidator());

// app.post('/secrets', testRoute.index);
// app.put('/secrets/:userId/:integrationName', testRoute.index);
// app.get('/secrets/:userId/:integrationName', testRoute.index);
// app.delete('/secrets/:userId/:integrationName', testRoute.index);

app.post('/token_urls', tokenRoute.createToken);
app.get('/token_urls/:token', tokenRoute.validateToken);
// app.delete('/token_urls/:token', testRoute.index);

let privateKey;
let certificate;
let passphrase;

try {
    privateKey  = fs.readFileSync('key.pem', 'utf8');
    certificate = fs.readFileSync('cert.pem', 'utf8');
    passphrase ='default'
} catch (err) {
    log.info("An error occurred while search for `key.pem` and `cert.pem`. " + err.toString())
}

let credentials = {key: privateKey, cert: certificate, passphrase: passphrase};

let httpsServer = https.createServer(credentials, app);

log.info('Express started on port 3000');
httpsServer.listen(3000);

// Export express app for testing
exports.app = app;
exports.identity_fqdn = config.get("IDENTITY_FQDN") || log.error('IDENTITY FQDN NOT PROVIDED!') && process.exit(-1);
exports.protocol = config.get("PROTOCOL") || log.error('PROTOCOL NOT PROVIDED!') && process.exit(-1);