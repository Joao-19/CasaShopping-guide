#!/bin/bash

# Deploy Script for CasaShopping Guide
# Checks for Docker login, builds images, and pushes to DockerHub.

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# 1. Check if logged in to DockerHub
if ! docker info | grep -q "Username"; then
    echo -e "${RED}Error: You are not logged in to DockerHub.${NC}"
    echo "Please run 'docker login' first."
    exit 1
fi

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
echo -e "${GREEN}Watchtower on the server should detect changes within 30 seconds.${NC}"
