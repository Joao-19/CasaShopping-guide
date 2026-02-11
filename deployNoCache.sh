#!/bin/bash
# Wrapper for deploy.sh that forces a clean build (no cache)

echo "Starting Clean Deployment (No Cache)..."
./deploy.sh --no-cache
