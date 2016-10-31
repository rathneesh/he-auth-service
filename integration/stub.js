const request = require('supertest')(require('../server.es6').app);

/* eslint-disable no-undef */

describe('Auth Service integration tests', function() {
  describe('Token enpoints', function() {
    it('should be alive', function(done) {
      request.post('/token_urls').expect(500, done);
    });
  });
});

