#!/bin/sh
set -e

# Function to replace environment variables
replace_env() {
    file=$1
    var_name=$2
    var_value=$(printenv "$var_name")

    # Always try to replace, even if value is empty (to clear placeholders like BASE_PATH)
    # Check if the placeholder exists in the file before trying to replace
    if grep -q "APP_$var_name" "$file"; then
        echo "Replacing APP_$var_name with '$var_value' in $file"
        # Use sed to replace the placeholder with the actual value (or empty string)
        # We use a different delimiter (|) to handle URLs containing slashes
        sed -i "s|APP_$var_name|$var_value|g" "$file"
    fi
}

echo "Starting deployment script for Web App..."

# Load environment variables from mounted .env file if it exists
if [ -f /app/.env ]; then
    echo "Loading environment variables from /app/.env..."
    set -a
    . /app/.env
    set +a
fi

# Next.js standalone output puts things in apps/web/.next
# Next.js standalone output puts things in apps/web/.next
# We search /app to catch everything including public folder and server.js
TARGET_DIR="/app"

echo "Replacing environment variables in $TARGET_DIR..."

# Emergency Fallback: If NEXT_PUBLIC_GTM_ID is missing or is the placeholder, use the known ID.
# Emergency Fallback removed. If valid GTM ID is not provided, it remains empty or placeholder.

# Pre-calculate vars to avoid calling env 1000 times
# Using 'env' and 'cut' to get variable names
VARS=$(env | grep '^NEXT_PUBLIC_' | cut -d= -f1)
VARS="$VARS NEXT_PUBLIC_GA4_ID"

if [ -z "$VARS" ]; then

# Optimized replacement: Find only files that actually contain placeholders
echo "Searching for files requiring replacement..."
FILES=$(find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.json" -o -name "*.html" -o -name "*.css" \) -exec grep -l "APP_NEXT_PUBLIC_" {} + 2>/dev/null || true)

if [ -n "$FILES" ]; then
    echo "Found files to process. Starting replacement..."
    for file in $FILES; do
        if [ -n "$VARS" ]; then
            for var in $VARS; do
                replace_env "$file" "$var"
            done
        fi
    done
else
    echo "No files found requiring replacement."
fi

echo "Environment variable replacement complete."
echo "Starting Next.js..."

echo "Starting Next.js..."

# Switch to 'nextjs' user to run the application
# This ensures successful startup after root modifications
exec su-exec nextjs:nodejs "$@"