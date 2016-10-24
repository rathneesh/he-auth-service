const uuid = require('uuid4');

// Temporary store for URL Tokens
class TokenList {
  constructor() {
    this.tokens = [];
    this.state = uuid();
  }

  removeToken(token) {
    let index = this.tokens.indexOf(token);
    if (index > -1) {
      this.tokens.splice(index, 1);
      return true;
    }
    this.state = uuid();
    return false;
  }

  addToken(token) {
    this.tokens.push(token);
    this.state = uuid();
  }

  hasToken(token) {
    return this.tokens.indexOf(token) !== -1;
  }

  getTokens() {
    return this.tokens;
  }

  getState() {
    return this.state;
  }
}

module.exports = exports = new TokenList();
