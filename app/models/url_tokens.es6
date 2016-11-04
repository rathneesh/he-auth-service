// Copyright 2016 Hewlett-Packard Development Company, L.P.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of
// this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to
// use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies
// of the Software, and to permit persons to whom the Software is furnished to do
// so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.
//
// END OF TERMS AND CONDITIONS

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
