#!/bin/zsh
set -euo pipefail

cd /Users/promax/AI/workspaces/loop-local

export NODE_ENV=production
export PORT="${PORT:-3001}"
export LOOP_LOCAL_DEPLOYMENT_TARGET="tailnet-preview"
export LOOP_LOCAL_PUBLIC_URL="${LOOP_LOCAL_PUBLIC_URL:-http://127.0.0.1:${PORT}}"

exec /usr/bin/env npm run start -- -p "$PORT"
