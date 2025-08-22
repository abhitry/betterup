#!/bin/sh

#/app/wait-for-redis.sh redis 6379

#exec bun run index.ts
#!/bin/sh
set -e

# Wait for Redis first
/app/wait-for-redis.sh redis 6379

# Start Pusher (replace index.ts with your actual entrypoint if different)
exec bun run --cwd /app/apps/pusher index.ts