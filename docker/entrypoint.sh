#!/bin/sh
set -e

# -------------------------------
# Wait for Postgres
# -------------------------------
echo "Waiting for Postgres at $DATABASE_URL..."
until psql "$DATABASE_URL" -c '\l' > /dev/null 2>&1; do
  echo "Waiting for Postgres..."
  sleep 1
done
echo "Postgres is up!"

# -------------------------------
# Run migrations and seed immediately after Postgres is ready
# -------------------------------
echo "Running Prisma migrations..."
cd /app/packages/store
bun run migrate:deploy

echo "Seeding database..."
bun run seed

# -------------------------------
# Wait for Redis
# -------------------------------
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}
echo "Waiting for Redis at $REDIS_HOST:$REDIS_PORT..."
until nc -z "$REDIS_HOST" "$REDIS_PORT"; do
  echo "Waiting for Redis..."
  sleep 1
done
echo "Redis is up!"

# -------------------------------
# Start API
# -------------------------------
echo "Starting API..."
cd /app/apps/api
bun run index.ts