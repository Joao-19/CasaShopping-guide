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

echo "Starting deployment script for Admin App..."

# Next.js standalone output puts things in apps/admin/.next
# We search /app to catch everything including public folder and server.js
TARGET_DIR="/app"

echo "Replacing environment variables in $TARGET_DIR..."

# Recursively find all files in the target directory, excluding node_modules
# We need to search specifically in .next/server/pages and .next/server/app where the actual code lives
echo "Searching in $TARGET_DIR..."

# Emergency Fallback: If NEXT_PUBLIC_GTM_ID is missing or is the placeholder, use the known ID.
if [ -z "$NEXT_PUBLIC_GTM_ID" ] || [ "$NEXT_PUBLIC_GTM_ID" = "APP_NEXT_PUBLIC_GTM_ID" ]; then
    echo "Warning: NEXT_PUBLIC_GTM_ID not set or is placeholder. Using hardcoded fallback: GTM-5MH287L"
    export NEXT_PUBLIC_GTM_ID="GTM-5MH287L"
fi

# Pre-calculate vars to avoid calling env 1000 times
# Using 'env' and 'cut' to get variable names
VARS=$(env | grep '^NEXT_PUBLIC_' | cut -d= -f1)

if [ -z "$VARS" ]; then
    echo "No NEXT_PUBLIC_ variables found to replace."
else
    echo "Found variables to replace: $(echo "$VARS" | tr '\n' ' ')"
fi

find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.json" -o -name "*.html" -o -name "*.css" \) -not -path "*/node_modules/*" | while read -r file; do
    # Dynamic replacement: Find all environment variables starting with NEXT_PUBLIC_
    # This enforces "Runtime Environment Priority" for ALL public variables automatically.
    if [ -n "$VARS" ]; then
        for var in $VARS; do
            replace_env "$file" "$var"
        done
    fi
done

echo "Environment variable replacement complete."
echo "Starting Next.js..."

exec "$@"