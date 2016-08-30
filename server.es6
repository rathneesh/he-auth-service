let express = require('express');
let path = require('path');
let config = require('nconf');
let bodyParser = require('body-parser');
let morgan = require('morgan');
let logger = require('winston');

let testRoute = require('./app/routes/test.es6');

// Load express
let app = express();

// Parse application/json
app.use(bodyParser.json())

app.get('/', testRoute.index);

console.log('Express started on port 3000');
app.listen(3000);

// Export express app for testing
exports.app = app;