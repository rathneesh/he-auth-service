// Temporary store for URL Tokens
class SecretsList {
    constructor() {
        this.secrets = [];
    }
    removeSecret(secret) {
        let index = this.secrets.indexOf(secret);
        if (index > -1) {
            this.secrets.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }
    addSecret(secret) {
        this.secrets.push(secret);
        return true;
    }
    hasSecret(secret) {
        return this.secrets.indexOf(secret) ==! -1;
    }
}

module.exports = exports = new SecretsList();