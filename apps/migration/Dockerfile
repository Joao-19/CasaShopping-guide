FROM node:20-slim

WORKDIR /app

# Install OpenSSL and Prisma in single optimized layer
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends openssl && \
    rm -rf /var/lib/apt/lists/* && \
    npm install prisma@5.22.0

# Copy schema and necessary files
COPY packages/database/prisma ./prisma

# Entry script
COPY apps/migration/init-db.sh .
RUN chmod +x init-db.sh

ENTRYPOINT ["./init-db.sh"]
