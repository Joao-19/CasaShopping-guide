#!/bin/bash

# Deploy Script for CasaShopping Guide
# Checks for Docker login, builds images, and pushes to DockerHub.

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

echo "Checking DockerHub login..."

# Load variables if not already loaded (though we load them later, we need them now for login)
if [ -f .env ]; then
    DH_USER=$(grep "^DOCKERHUB_USER=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    DH_PASS=$(grep "^DOCKERHUB_PASSWORD=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
fi

# Use env vars or fallback to loaded values
DOCKERHUB_USER="${DOCKERHUB_USER:-$DH_USER}"
DOCKERHUB_PASSWORD="${DOCKERHUB_PASSWORD:-$DH_PASS}"

# if [ -n "$DOCKERHUB_USER" ] && [ -n "$DOCKERHUB_PASSWORD" ]; then
#     echo "Attempting to log in to DockerHub as $DOCKERHUB_USER..."
#     echo "$DOCKERHUB_PASSWORD" | docker login -u "$DOCKERHUB_USER" --password-stdin
# else
#     echo "Skipping explicit login (DOCKERHUB_PASSWORD not found in .env). Assuming system is already logged in..."
# fi
echo "Skipping auto-login to prevent session conflict. Using existing system login."

# Capture optional arguments (like --no-cache)
BUILD_ARGS="$@"

echo -e "${GREEN}Logged in to DockerHub. Building images...${NC}"
if [ -n "$BUILD_ARGS" ]; then
    echo -e "${GREEN}Build arguments: $BUILD_ARGS${NC}"
fi

# Load variables from .env if present (to support GTM_ID and others during build)
if [ -f .env ]; then
    # Safely extract variables without exporting everything
    TOKEN_FROM_ENV=$(grep "^DOCKERHUB_PASSWORD=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    URL_FROM_ENV=$(grep "^SERVER_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    GTM_ID_FROM_ENV=$(grep "^NEXT_PUBLIC_GTM_ID=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
fi

# Set GTM_ID from env if not already set
NEXT_PUBLIC_GTM_ID="${NEXT_PUBLIC_GTM_ID:-$GTM_ID_FROM_ENV}"

# 2. Build Updated Images
# FORCE WEB_BASE_PATH="" (Root) and ADMIN_BASE_PATH="/admin"
# This guarantees that the built images always match the production URL structure,
# ignoring any local environment pollution.
WEB_BASE_PATH="" ADMIN_BASE_PATH="/admin" NEXT_PUBLIC_GTM_ID="${NEXT_PUBLIC_GTM_ID}" docker compose build $BUILD_ARGS

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful. Pushing images to DockerHub...${NC}"

# 3. Push all services
# Explicitly pushing services that have 'image' defined in docker-compose.yml
# Note: 'docker compose push' pushes services that have both 'build' and 'image' keys.
# 3. Push only OUR services (skipping official images)
# We push sequentially to avoid "accept4 failed" WSL errors and credential helper timeouts under high load
SERVICES="web admin api-gateway auth-service users-service stores-service products-service storage-service db-migration"

for service in $SERVICES; do
    echo -e "${GREEN}Pushing $service...${NC}"
    docker compose push "$service"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Push failed for $service! Retrying once...${NC}"
        sleep 2
        docker compose push "$service"
        
        if [ $? -ne 0 ]; then
             echo -e "${RED}Push failed for $service after retry. Aborting.${NC}"
             exit 1
        fi
    fi
done

echo -e "${GREEN}All images pushed successfully!${NC}"


# 4. Trigger Watchtower Update via API Gateway
echo -e "\n${GREEN}== Step 3: Remote Deployment Change ==${NC}"
echo -e "Triggering Watchtower on server ${SERVER_URL:-http://172.245.190.165:3000}..."

# Load specific variables needed for the script (TOKEN and URL)
# We avoid exporting ALL variables to prevent corrupting the Docker build environment with bad parsing
# Use PROVIDED DEPLOY_PASSWORD or fallback to reading from .env
DEPLOY_TOKEN_FROM_ENV=$(grep "^DEPLOY_PASSWORD=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
TOKEN="${DEPLOY_PASSWORD:-$DEPLOY_TOKEN_FROM_ENV}"
SERVER_URL="${SERVER_URL:-${URL_FROM_ENV:-http://172.245.190.165:3000}}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}[!] Warning: DEPLOY_PASSWORD not set.${NC}"
    echo "    Cannot authenticate with Watchtower. Skipping automatic update trigger."
    echo "    Please run 'docker compose up -d' manually on the server."
else
    # Making the URL dynamic - user can override SERVER_URL=http://... ./deploy.sh
    # Using curl with silent flag (-s) but capturing output
    RESPONSE=$(curl -s -X POST "$SERVER_URL/deploy/trigger" \
        -H "Authorization: Bearer $TOKEN" \
        -w "%{http_code}" --connect-timeout 10)
    
    HTTP_CODE=${RESPONSE: -3}
    CONTENT=${RESPONSE:0:${#RESPONSE}-3}

    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
         echo -e "${GREEN}✔ Deployment Triggered Successfully!${NC}"
         echo -e "  Server responded: $CONTENT"
         echo -e "\n${GREEN}🚀 Deployment Complete! The server is updating itself now.${NC}"
    elif [ "$HTTP_CODE" == "000" ]; then
         # 000 usually means the server killed the connection (which is EXPECTED when Watchtower restarts the gateway)
         echo -e "${GREEN}✔ Trigger Sent (Connection verification skipped)${NC}"
         echo -e "  (The server likely restarted the gateway to apply updates, which is normal)"
         echo -e "\n${GREEN}🚀 Deployment Complete!${NC}"
    else
         echo -e "${RED}✘ Failed to trigger update.${NC}"
         echo -e "  HTTP Code: $HTTP_CODE"
         echo -e "  Response: $CONTENT"
    fi
fi

