const express = require('express');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const bodyParser = require('body-parser');

/* eslint-disable quote-props */
const IDM_AUTH_EXAMPLE_RESPONSE = {
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
  "token": {
    "expires": "2016-05-25T17:11:52.000Z",
    "id": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9.TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ",
    "issued_at": "2016-05-25T16:41:52.375Z",
    "tenant": {
      "enabled": true,
      "id": "asdcadssa-asdc-asdcasd-asdcsadc-sadcdsac",
      "name": "public"
    }
  },
  "user": {
    "id": "sadcas-asdfv-wth45tg-wtw4t-qhqo38f873",
    "name": "hangout",
    "roles": [
      {
        "id": "asvfvfv-kfvmd-riue-weuhwe-aerverdfv",
        "name": "DFVSDFV"
      },
      {
        "id": "aferbebt-67jryryr-54y45gr-w45gw4rg-wtwrthrt",
        "name": "DSFVDS"
      },
      {
        "id": "98jer9ve-76gevyev-6532vgew-09erjvef-23fweasdvf",
        "name": "SDFVDSFV"
      },
      {
        "id": "347f6gebhf-45uyg-suvybrv-weuyfvwe-sdycvw",
        "name": "DFVSSDFV"
      },
      {
        "id": "ehvwf-sdjhvcbsd-sdjkcks-fvknd-erbvke",
        "name": "SDFVSDFV"
      },
      {
        "id": "sdjvhbdv-sdvhbj-weoifwe-sejchb-weucybw",
        "name": "DSFVDSFV"
      },
      {
        "id": "wefjhbw-webhsd-wejsd-736fgyr-3265df",
        "name": "FGNFG"
      },
      {
        "id": "43f67gew-2376ge-092j3iowe-23dsds-3746gfds",
        "name": "AWKVNAF"
      },
      {
        "id": "23f5tygw-4578gyub-47gysd-23ytdv-23tfysd",
        "name": "AWUEYVDS"
      },
      {
        "id": "3476gyd-45jfdd-346tygs-265tyg-7845yuhj",
        "name": "AJSVBHDF"
      },
      {
        "id": "9203iosd-23fwdf-76tyrgh-8iuj-26tygsd",
        "name": "true"
      }
    ]
  }
};

class IdmMockServer {
  constructor() {
    /* TODO: Gracefully close server after request */
    this.app = express();
    this.server = null;
    this.isRunning = false;
  }

  run(username, password, tenantName, tenantPassword, cb) {
    // Setup basic auth strategy
    passport.use(new BasicStrategy(
      function(_username, _password, callback) {
        if (
          username === _username &&
          password === _password
          ) {
          return callback(null, _username);
        }

        return callback(null, false);
      }
    ));

    // Create our Express application
    this.app.use(bodyParser.json());

    this.app.post('/',
      passport.authenticate('basic', {session: false}),
      function(req, res) {
        if (
          req.body.passwordCredentials.username === username &&
          req.body.passwordCredentials.password === password &&
          req.body.tenantName === tenantName
          ) {
          res.status(200).json(IDM_AUTH_EXAMPLE_RESPONSE);
        } else {
          res.status(401).send('Sorry, we cannot find that!');
        }
      });

    this.server = this.app.listen(0, () => {
      cb(this.server.address().port);
    });
  }
}

exports.IdmMockServer = new IdmMockServer();
