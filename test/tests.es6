let app  = require('../server.es6').app;
let request  = require('supertest');

describe('GET /', function() {
    it('respond with json', function(done) {
        request(app)
            .get('/')
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});