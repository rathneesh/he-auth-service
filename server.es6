let express = require('express');
let https = require('https');
let fs = require('fs');
let config = require('nconf');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let logger = require('winston');
var helmet = require('helmet');

let testRoute = require('./app/routes/test.es6');

// Load express
let app = express();

// Helmet can help protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately.
app.use(helmet());

// Parse application/json
app.use(bodyParser.json());

app.get('/', testRoute.index);

let privateKey;
let certificate;
let passphrase;

try {
    privateKey  = fs.readFileSync('key.pem', 'utf8');
    certificate = fs.readFileSync('cert.pem', 'utf8');
    passphrase ='default'
} catch (err) {
    console.log("An error occurred while search for `key.pem` and `cert.pem`. " + err.toString())
}

let credentials = {key: privateKey, cert: certificate, passphrase: passphrase};

let httpsServer = https.createServer(credentials, app);

console.log('Express started on port 3000');
httpsServer.listen(3000);

// Export express app for testing
exports.app = app;