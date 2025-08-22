#!/bin/sh

# Host and port to check
HOST=${1:-redis}
PORT=${2:-6379}

echo "Waiting for Redis at $HOST:$PORT..."

# Wait until Redis is up
while ! nc -z "$HOST" "$PORT"; do
  echo "Waiting for Redis..."
  sleep 1
done

echo "Redis is up!"

