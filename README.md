# he-auth-service

## Getting started

> Clone this repository into your local environment.

### Generate keys

1. Create an `ssl` certificate and key and place them in a directory called `certs`. These will be used by the express server.

  Example:

  ```bash
  # in certs/ dir
  openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 9999
  ```

2. Create key pairs to encrypt / decrypt JWE `token_urls`.

  ```bash
  # in certs/ dir
  openssl req -keyform PEM -nodes -newkey rsa:4096 -keyout jwe_token_url.pem -pubkey -out jwe_token_url_pub.pem
  ```

3. Create key pairs to encrypt / decrypt `secrets` (JWE).

  ```bash
  # in certs/ dir
  openssl req -keyform PEM -nodes -newkey rsa:4096 -keyout jwe_secrets.pem -pubkey -out jwe_secrets_pub.pem
  ```

4. Create key pairs to sign / verify `jwt` tokens.

  ```bash
  # in certs/ dir
  openssl req -keyform PEM -nodes -newkey rsa:4096 -keyout jwt_token.pem -pubkey -out jwt_token_pub.pem
  ```

### Run with docker-compose

```bash
# To build and run:
docker-compose up --build
 
# Or to just run (with local built image):
docker-compose up

# Add dc.proxy.yml if you are running within environment with http_proxy
docker-compose -f docker-compose.yml -f dc.proxy.yml up

# Add dc.dev.yml if you want to mount the current source code for development
# (instead of local built image)
docker-compose -f docker-compose.yml -f dc.dev.yml up

# Develop under http_proxy environment
docker-compose -f docker-compose.yml -f dc.proxy.yml -f dc.dev.yml up
```

> Your `he-auth-service` will be available on `localhost:8080`.

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
    -k https://localhost:8080/token_urls

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
  https://localhost:8080/token_urls/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
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
  https://localhost:8080/secrets
```

> `secrets` should contain a JWE encrypted json.

> `token` should contain a valid JWE encrypted token.

#### Secrets get

```bash
curl -k -H "Content-Type: application/json" \
  https://localhost:8080/secrets/hello/efve
```

#### Secrets delete

```bash
curl -k -H "Content-Type: application/json" \
  -X DELETE https://localhost:8080/secrets/hello/efve
```

#### Secrets put

```bash
curl -k -H "Content-Type: application/json" \
  -X DELETE https://localhost:8080/secrets/hello/efve
```
