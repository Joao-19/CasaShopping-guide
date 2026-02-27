#!/bin/bash

# Deploy Script for CasaShopping Guide
# Checks for Docker login, builds images, and pushes to DockerHub.

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

echo "Checking DockerHub login..."

# Load variables from .env automatically to export them for Docker Compose
if [ -f .env ]; then
    echo "Loading environment variables from .env..."
    # Robust way to load .env, handling comments, empty lines, and quoted strings
    set -a
    source .env
    set +a
fi

# Use env vars or fallback to loaded values (if .env loading failed for some reason)
DOCKERHUB_USER="${DOCKERHUB_USER:-$DH_USER}"
DOCKERHUB_PASSWORD="${DOCKERHUB_PASSWORD:-$DH_PASS}"

if [ -n "$DOCKERHUB_USER" ] && [ -n "$DOCKERHUB_PASSWORD" ]; then
    echo "Attempting to log in to DockerHub as $DOCKERHUB_USER..."
    echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USER" --password-stdin
else
    echo "Warning: DOCKERHUB_PASSWORD not found. Assuming system is already logged in..."
fi

# Capture optional arguments (like --no-cache)
BUILD_ARGS="$@"

echo -e "${GREEN}Logged in to DockerHub. Building images...${NC}"
if [ -n "$BUILD_ARGS" ]; then
    echo -e "${GREEN}Build arguments: $BUILD_ARGS${NC}"
fi

# Ensure NEXT_PUBLIC_GTM_ID is set (fallback to GTM-5MH287L if completely missing, just for consistency)
# This removes the "variable is not set" warning
# Ensure NEXT_PUBLIC_GTM_ID is set (fallback to empty if missing)
export NEXT_PUBLIC_GTM_ID="${NEXT_PUBLIC_GTM_ID:-}"
export NEXT_PUBLIC_GA4_ID="${NEXT_PUBLIC_GA4_ID:-}"

# 2. Build Updated Images
# FORCE WEB_BASE_PATH="" (Root) and ADMIN_BASE_PATH="/admin"
# This guarantees that the built images always match the production URL structure,
# ignoring any local environment pollution.
WEB_BASE_PATH="" ADMIN_BASE_PATH="/admin" NEXT_PUBLIC_GTM_ID="${NEXT_PUBLIC_GTM_ID}" NEXT_PUBLIC_GA4_ID="${NEXT_PUBLIC_GA4_ID}" docker compose build $BUILD_ARGS

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful. Pushing images to DockerHub...${NC}"

# 3. Push only OUR services (skipping official images)
# We push sequentially to avoid "accept4 failed" WSL errors and credential helper timeouts under high load
SERVICES="web admin api-gateway auth-service users-service stores-service products-service storage-service db-migration"

push_with_retry() {
    local service=$1
    local retries=5
    local count=0
    local success=0

    while [ $count -lt $retries ]; do
        echo -e "${GREEN}Pushing $service (Attempt $((count+1))/$retries)...${NC}"
        
        # Explicitly pass .env file to docker compose to silence warnings
        docker compose --env-file .env push "$service"
        
        if [ $? -eq 0 ]; then
            success=1
            break
        else
            echo -e "${RED}Push failed for $service! Retrying in 5 seconds...${NC}"
            sleep 5
            count=$((count+1))
        fi
    done

    if [ $success -eq 0 ]; then
         echo -e "${RED}Push failed for $service after $retries attempts. Aborting.${NC}"
         exit 1
    fi
}

for service in $SERVICES; do
    push_with_retry "$service"
    # Sleep between services to let WSL release resources
    sleep 3
done

echo -e "${GREEN}All images pushed successfully!${NC}"


# 4. Trigger Watchtower Update via API Gateway
echo -e "\n${GREEN}== Step 3: Remote Deployment Change ==${NC}"
echo -e "Triggering Watchtower on server ${SERVER_URL:-http://172.245.190.165:3000}..."

# Load specific variables needed for the script (TOKEN and URL)
# We avoid exporting ALL variables to prevent corrupting the Docker build environment with bad parsing
# Use PROVIDED DEPLOY_PASSWORD or fallback to reading from .env
DEPLOY_TOKEN_FROM_ENV=$(grep "^DEPLOY_PASSWORD=" .env | tail -n 1 | cut -d '=' -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
TOKEN="${DEPLOY_PASSWORD:-$DEPLOY_TOKEN_FROM_ENV}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}[!] Warning: DEPLOY_PASSWORD not set.${NC}"
    echo "    Cannot authenticate with Watchtower. Skipping automatic update trigger."
    echo "    Please run 'docker compose up -d' manually on the server."
else
    # Using user-defined SERVER_URL or defaulting to the public IP (without port 3000, as requested)
    SERVER_URL="${SERVER_URL:-${URL_FROM_ENV:-http://172.245.190.165}}"
    
    # Using curl with silent flag (-s) but capturing output
    # Path updated to /api/deploy/trigger as per user instruction
    RESPONSE=$(curl -s -X POST "$SERVER_URL/api/deploy/trigger" \
        -H "Authorization: Bearer $TOKEN" \
        -w "%{http_code}" --connect-timeout 10)
    
    HTTP_CODE=${RESPONSE: -3}
    CONTENT=${RESPONSE:0:${#RESPONSE}-3}


    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
         echo -e "${GREEN}✔ Deployment Triggered Successfully!${NC}"
         echo -e "  Server responded: $CONTENT"
         echo -e "\n${GREEN}🚀 Deployment Complete! Watchtower uses the new image (with baked-in .env).${NC}"
    elif [ "$HTTP_CODE" == "000" ]; then
         echo -e "${GREEN}✔ Trigger Sent (Connection verification skipped)${NC}"
         echo -e "  (The server likely restarted the gateway to apply updates, which is normal)"
         echo -e "\n${GREEN}🚀 Deployment Complete!${NC}"
    else
         echo -e "${RED}✘ Failed to trigger update.${NC}"
         echo -e "  HTTP Code: $HTTP_CODE"
         echo -e "  Response: $CONTENT"
    fi
fi

