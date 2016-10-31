# Create new docker network for running integration tests
docker network create --driver bridge integration

# Build he-auth-service image
docker build --tag auth-service:integration .

docker run -d \
    --network=integration \
    --name=vault \
    -e VAULT_DEV_ROOT_TOKEN_ID=sdcsd \
    -e VAULT_DEV_LISTEN_ADDRESS=0.0.0.0:8200 \
    vault:0.6.1

# Run integration tests
docker run \
    --network=integration \
    --name=integration \
    -e HE_ISSUER=issue \
    -e HE_AUDIENCE=audience \
    -e HE_AUTH_SSL_PASS=default \
    -e VAULT_DEV_ROOT_TOKEN_ID=default \
    -e HE_IDENTITY_PORTAL_ENDPOINT=http://example.com \
    -e HE_IDENTITY_WS_ENDPOINT=http://example.com \
    -v `pwd`/certs:/usr/src/app/certs \
    auth-service:integration ./node_modules/.bin/mocha --recursive --growl --check-leaks ./integration/*.js
    
# Cleanup
docker rm -f integration authservice vault
docker network rm integration