// Temporary store for URL Tokens
class TokenList {
    constructor() {
        this.tokens = [];
    }
    removeToken(token) {
        let index = this.tokens.indexOf(token);
        if (index > -1) {
            this.tokens.splice(index, 1);
            return true;
        } else {
            return false
        }
    }
    addToken(token) {
        this.tokens.append(token);
    }
    hasToken(token) {
        return this.tokens.indexOf(token) ==! -1;
    }
}

module.exports = exports = new TokenList();