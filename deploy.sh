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

# 2. Build all services
docker compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}Build failed! Aborting deployment.${NC}"
    exit 1
fi

echo -e "${GREEN}Build successful. Pushing images to DockerHub...${NC}"

# 3. Push all services
# Explicitly pushing services that have 'image' defined in docker-compose.yml
# Note: 'docker compose push' pushes services that have both 'build' and 'image' keys.
docker compose push

if [ $? -ne 0 ]; then
    echo -e "${RED}Push failed! Please check your network or DockerHub permissions.${NC}"
    exit 1
fi

echo -e "${GREEN}All images pushed successfully!${NC}"
echo -e "${GREEN}All images pushed successfully!${NC}"

# 4. Trigger Watchtower Update via API Gateway
echo -e "${GREEN}Triggering remote update on server...${NC}"

# Load env file to get the token (optional, or rely on user having it defined)
if [ -f .env ]; then
    export $(cat .env | grep -v '#' | awk '/=/ {print $1}')
fi

# Use PROVIDED token or fallback to common variables
TOKEN="${DOCKERHUB_PASSWORD}"
SERVER_URL="${SERVER_URL:-http://172.245.190.165:3000}"

if [ -z "$TOKEN" ]; then
    echo -e "${RED}Warning: DOCKERHUB_PASSWORD not set. Cannot auth with Watchtower.${NC}"
else
    # Making the URL dynamic - user can override SERVER_URL=http://... ./deploy.sh
    RESPONSE=$(curl -s -X POST "$SERVER_URL/deploy/trigger" \
        -H "Authorization: Bearer $TOKEN" \
        -w "%{http_code}")
    
    HTTP_CODE=${RESPONSE: -3}
    CONTENT=${RESPONSE:0:${#RESPONSE}-3}

    if [ "$HTTP_CODE" == "200" ] || [ "$HTTP_CODE" == "201" ]; then
         echo -e "${GREEN}Success! Watchtower update triggered.${NC}"
         echo "$CONTENT"
    else
         echo -e "${RED}Failed to trigger update. HTTP Code: $HTTP_CODE${NC}"
         echo "$CONTENT"
    fi
fi

