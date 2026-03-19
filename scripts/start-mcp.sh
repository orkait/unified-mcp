#!/usr/bin/env bash
set -euo pipefail

CONTAINER="unified-mcp-daemon"
IMAGE="unified-mcp"

# Start the daemon container if it's not already running
if ! docker ps -q --filter "name=^${CONTAINER}$" 2>/dev/null | grep -q .; then
    # Remove a stopped container with the same name if one exists
    docker rm -f "$CONTAINER" 2>/dev/null || true

    # Start container as a long-running daemon (tail keeps it alive)
    # Override entrypoint so it doesn't run node immediately
    docker run -d \
        --name "$CONTAINER" \
        --restart unless-stopped \
        --entrypoint tail \
        "$IMAGE" -f /dev/null

    # Brief wait for container to be ready
    sleep 0.5
fi

# Spawn the MCP server process in the daemon container.
# Each Claude session gets its own node process via exec.
exec docker exec -i "$CONTAINER" node dist/index.js
