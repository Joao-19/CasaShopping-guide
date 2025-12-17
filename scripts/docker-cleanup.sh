#!/bin/bash

# Docker Cleanup Script
# Run this via cron or manually to free up disk space.

echo "Started cleanup at $(date)"

# 1. Remove unused containers (stopped ones)
docker container prune -f

# 2. Remove unused images (dangling)
# Add -a to remove ALL images not used by a running container (be careful with build cache)
docker image prune -f

# 3. Remove build cache (can be safe to run periodically if you don't build often)
# docker builder prune -f

# 4. Global system prune (Be careful: removes stopped containers, networks, runtimes)
# docker system prune -af --volumes

echo "Cleanup finished at $(date)"
