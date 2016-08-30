var express = require('express');
var path = require('path');

// Local dependecies
var config = require('nconf');

// create the express app
// configure middlewares
var bodyParser = require('body-parser');
var morgan = require('morgan');
var logger = require('winston');

var app = express();

app.get('/', function(req, res){
    res.send('Hello World');
});

console.log('Express started on port 3000');
app.listen(3000);
