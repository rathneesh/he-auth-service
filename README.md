# he-auth-service

## Getting started 

> Clone this repository into your local environment.

### Generate key cert

```bash
    # create certificates in ./certs directory
    mkdir certs && \
        openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 9999
```

### Run with docker-compose

```bash
# To build and run:
docker-compose up --build
 
# Or to just run (with local built image):
docker-compose up
```

> Your `he-auth-service` will be available on `localhost:8080`.

## API Usage

### `token_url` actions
 
#### Create

```bash

# Create token_url that expires in 5 minutes
curl -H "Content-Type: application/json" \
    -X POST \
    -d '{"user_info":"xyz","integration_info":"xyz","bot_info":"xyz","url_props": {"ttl": 300}}' \
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

> Use the endpoint of the `he-auth-service` and append the `token` value from above to get the infor. 

```bash
curl -k https://localhost:8080/token_urls/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJIRV9ERUZBVUxUX0lTU1VFUiIsImF1ZCI6WyJIRV9ERUZBVUxUX0FVRElFTkNFIl0sImlhdCI6MTQ3NDczNDM3My43NjksImp0aSI6IjRiYjllNTIyLThmZjYtNGZmYS1iYzU2LTg0ZmU2NTZjYzQ2ZCIsImJvdF9pbmZvIjoieHl6IiwidXNlcl9pbmZvIjoieHl6IiwiaW50ZWdyYXRpb25faW5mbyI6Inh5eiIsImV4cCI6MTQ3NDczNDM3OC43Njl9.mD-iKAj5CfnT0215oi3W8wrXaLORKk-SApAFreC_B00
```

#### Secrets post

```bash
curl -H "Content-Type: application/json" -k -X POST -d '{"secrets": {"password": "xyz"}, "user_info": {"id": "hello"}, "integration_name": {"name": "efve"} }' https://localhost:8080/secrets
```