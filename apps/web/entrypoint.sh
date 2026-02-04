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

# Next.js standalone output puts things in apps/web/.next
TARGET_DIR="/app/apps/web"

echo "Replacing environment variables in $TARGET_DIR..."

# Recursively find all files in the target directory
# Recursively find all files in the target directory, excluding node_modules
echo "Searching in $TARGET_DIR..."

find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.json" -o -name "*.html" -o -name "*.css" \) -not -path "*/node_modules/*" | while read -r file; do
    replace_env "$file" "NEXT_PUBLIC_API_URL"
    replace_env "$file" "NEXT_PUBLIC_API_HOST"
    replace_env "$file" "NEXT_PUBLIC_STORAGE_URL"
    replace_env "$file" "NEXT_PUBLIC_BASE_PATH"
done

echo "Environment variable replacement complete."
echo "Starting Next.js..."

exec "$@"
