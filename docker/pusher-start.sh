#!/bin/sh
#/app/wait-for-redis.sh redis 6379
#exec sh -c "bun run --cwd /app/packages/store seed && bun run start"


#!/bin/sh
set -e

# -------------------------------
# Wait for Redis
# -------------------------------
REDIS_HOST=${REDIS_HOST:-redis}
REDIS_PORT=${REDIS_PORT:-6379}

/app/wait-for-redis.sh "$REDIS_HOST" "$REDIS_PORT"

# -------------------------------
# Start Pusher
# -------------------------------
# Assuming pusher index.ts is the entry point
exec bun run --cwd /app/apps/pusher index.ts