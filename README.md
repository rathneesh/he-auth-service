# he-auth-service

## Getting started

> Clone this repository into your local environment.

### Generate keys

- Install `openssl` in your machine.
- Run the the following script which should generate a set of keys under `./certs` directory.

  ```bash
  # Fill-in values,
  # Don't use any passphrases or challenges in the openssl Q&A
  ./scripts/gen_certs.sh
  ```

The certificates generated by the script are the following (public keys are suffixed by `_pub.pem`):
  - `cert.pem / key.pem`: an `ssl` certificate key pair that is used by the `nginx` container.
  - `jwe_secrets.pem / jwe_secrets_pub.pem`: key pair that is used to encrypt / decrypt secrets.
     - `jwe_secrets_pub.pem` required by `he-identity-portal` to encrypt secrets.
     - `jwe_secrets.pem` required by `he-auth-service` to decrypt secrets.
  - `jwe_token_url.pem / jwe_token_url_pub.pem`: key pair used to encrypt / decrypt `jwe` tokens (from urls).
    - `jwe_token_url.pem` required by `he-identity-portal` **and** `he-auth-service` to decrypt tokens.
    - `jwe_token_url_pub.pem` required by `he-auth-service` to encrypt tokens.
  - `jwt_token.pem / jwt_token_pub.pem`: key pair used to sign / verify `jwt` tokens (from urls).
    - `jwt_token.pem`: required by `he-auth-service` to sign tokens.
    - `jwt_token_pub.pem` required by `he-identity-portal` **and** `he-auth-service` to verify tokens.

### Run with docker-compose

> TODO: describe all _required_ and _optional_ environment variables.

```bash
# To build and run:
docker-compose up --build
 
# Or to just run (with local built image):
docker-compose up

# Add dc.proxy.yml if you are running within environment with http_proxy
docker-compose -f docker-compose.yml -f dc.proxy.yml up

# Add dc.dev.yml if you want to mount the current source code for development
# (instead of local built image)
# You must have run "npm install" on your local directory.
docker-compose -f docker-compose.yml -f dc.dev.yml up

# Develop under http_proxy environment
docker-compose -f docker-compose.yml -f dc.proxy.yml -f dc.dev.yml up
```

> Your `he-auth-service` will be available on `localhost:8081`.

## API Usage

### `token_url` actions
 
#### Create a JWE encypted token

```bash

# Create token_url that expires in 5 minutes
curl \
    -H "Content-Type: application/json" \
    -X POST -d '{"user_info":{"id":"USERID"},
    "integration_info":{"name":"INTEGRATION_NAME", 
    "auth": "AUTH"},"bot_info":"bot info",
    "url_props": {"ttl": 300}}' \ 
    -k https://localhost:8081/token_urls

```

Sample Response:

```json
{
   "message":"token_url created",
   "token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIRV9ERUZBVUxUX0lTU1VFUiIsImF1ZCI6WyJIRV9ERUZBVUxUX0FVRElFTkNFIl0sImlhdCI6MTQ3NDczNDM3My43NjksImp0aSI6IjRiYjllNTIyLThmZjYtNGZmYS1iYzU2LTg0ZmU2NTZjYzQ2ZCIsImJvdF9pbmZvIjoieHl6IiwidXNlcl9pbmZvIjoieHl6IiwiaW50ZWdyYXRpb25faW5mbyI6Inh5eiIsImV4cCI6MTQ3NDczNDM3OC43Njl9.mD-iKAj5CfnT0215oi3W8wrXaLORKk-SApAFreC_B00",
   "url":"https://example.com/signin/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIRV9ERUZBVUxUX0lTU1VFUiIsImF1ZCI6WyJIRV9ERUZBVUxUX0FVRElFTkNFIl0sImlhdCI6MTQ3NDczNDM3My43NjksImp0aSI6IjRiYjllNTIyLThmZjYtNGZmYS1iYzU2LTg0ZmU2NTZjYzQ2ZCIsImJvdF9pbmZvIjoieHl6IiwidXNlcl9pbmZvIjoieHl6IiwiaW50ZWdyYXRpb25faW5mbyI6Inh5eiIsImV4cCI6MTQ3NDczNDM3OC43Njl9.mD-iKAj5CfnT0215oi3W8wrXaLORKk-SApAFreC_B00"
}
```

#### Get

> Use the endpoint of the `he-auth-service` and append the `token` value from above to get the information. 

```bash
curl -k  \
  https://localhost:8081/token_urls/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
  eyJpc3MiOiJIRV9ERUZBVUxUX0lTU1VFUiIsImF1ZCI6WyJIRV9ERUZBVUxUX0FVRElFTkN
  FIl0sImlhdCI6MTQ3NDczNDM3My43NjksImp0aSI6IjRiYjllNTIyLThmZjYtNGZmYS1iYz
  U2LTg0ZmU2NTZjYzQ2ZCIsImJvdF9pbmZvIjoieHl6IiwidXNlcl9pbmZvIjoieHl6Iiwia
  W50ZWdyYXRpb25faW5mbyI6Inh5eiIsImV4cCI6MTQ3NDczNDM3OC43Njl9.mD-iKAj5Cfn
  T0215oi3W8wrXaLORKk-SApAFreC_B00
```

#### Secrets post

```bash
SECRETS=<JWE encrypted JSON>
TOKEN=<JWE encrypted token>
curl -k -H "Content-Type: application/json" \
  -X POST -d "{\"secrets\": \"\", \"token\": \"\" }" \
  https://localhost:8081/secrets
```

> `secrets` should contain a JWE encrypted json.

> `token` should contain a valid JWE encrypted token.

#### Secrets get

```bash
curl -k -H "Content-Type: application/json" \
  https://localhost:8081/secrets/hello/efve
```

#### Secrets delete

```bash
curl -k -H "Content-Type: application/json" \
  -X DELETE https://localhost:8081/secrets/hello/efve
```

#### Secrets put

```bash
curl -k -H "Content-Type: application/json" \
  -X DELETE https://localhost:8081/secrets/hello/efve
```
