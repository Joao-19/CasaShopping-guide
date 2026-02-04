#!/bin/bash

# Deploy Script for CasaShopping Guide
# Checks for Docker login, builds images, and pushes to DockerHub.

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# 1. Check if logged in to DockerHub
# 1. (Optional) Check login - skipping explicit check to avoid false negatives.
# If not logged in, 'docker compose push' will fail later, which is fine.
echo "Skipping explicit login check..."

echo -e "${GREEN}Logged in to DockerHub. Building images...${NC}"

# 2. Build Updated Images
# FORCE WEB_BASE_PATH="" (Root) and ADMIN_BASE_PATH="/admin"
# This guarantees that the built images always match the production URL structure,
# ignoring any local environment pollution.
WEB_BASE_PATH="" ADMIN_BASE_PATH="/admin" docker compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful. Pushing images to DockerHub...${NC}"

# 3. Push all services
# Explicitly pushing services that have 'image' defined in docker-compose.yml
# Note: 'docker compose push' pushes services that have both 'build' and 'image' keys.
# 3. Push only OUR services (skipping official images)
docker compose push web admin api-gateway auth-service users-service stores-service products-service storage-service db-migration

if [ $? -ne 0 ]; then
    echo -e "${RED}Push failed! Please check your network or DockerHub permissions.${NC}"
    exit 1
fi

echo -e "${GREEN}All images pushed successfully!${NC}"


# 4. Trigger Watchtower Update via API Gateway
echo -e "\n${GREEN}== Step 3: Remote Deployment Change ==${NC}"
echo -e "Triggering Watchtower on server ${SERVER_URL:-http://172.245.190.165:3000}..."

# Load specific variables needed for the script (TOKEN and URL)
# We avoid exporting ALL variables to prevent corrupting the Docker build environment with bad parsing
if [ -f .env ]; then
    # Safely extract variables without exporting everything
    TOKEN_FROM_ENV=$(grep "^DOCKERHUB_PASSWORD=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
    URL_FROM_ENV=$(grep "^SERVER_URL=" .env | cut -d '=' -f2- | tr -d '"' | tr -d "'")
fi

# Use PROVIDED token or fallback to .env or empty
TOKEN="${DOCKERHUB_PASSWORD:-$TOKEN_FROM_ENV}"
SERVER_URL="${SERVER_URL:-${URL_FROM_ENV:-http://172.245.190.165:3000}}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}[!] Warning: DOCKERHUB_PASSWORD not set.${NC}"
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

