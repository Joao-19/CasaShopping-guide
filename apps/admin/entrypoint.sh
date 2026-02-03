#!/bin/sh
set -e

# Function to replace environment variables
replace_env() {
    file=$1
    var_name=$2
    var_value=$(printenv "$var_name")

    if [ -n "$var_value" ]; then
        # Check if the placeholder exists in the file before trying to replace
        if grep -q "APP_$var_name" "$file"; then
            echo "Replacing APP_$var_name with $var_value in $file"
            # Use sed to replace the placeholder with the actual value
            # We use a different delimiter (|) to handle URLs containing slashes
            sed -i "s|APP_$var_name|$var_value|g" "$file"
        fi
    fi
}

echo "Starting deployment script for Admin App..."

TARGET_DIR="/app/.next"

echo "Replacing environment variables in $TARGET_DIR..."

find "$TARGET_DIR" -type f \( -name "*.js" -o -name "*.json" -o -name "*.html" \) | while read -r file; do
    replace_env "$file" "NEXT_PUBLIC_API_URL"
    replace_env "$file" "NEXT_PUBLIC_API_HOST"
    replace_env "$file" "NEXT_PUBLIC_WEB_URL"
    replace_env "$file" "NEXT_PUBLIC_BASE_PATH"
done

echo "Environment variable replacement complete."
echo "Starting Next.js..."

exec "$@"
