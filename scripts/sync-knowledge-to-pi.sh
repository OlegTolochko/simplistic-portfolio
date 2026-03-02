#!/usr/bin/env bash
#
# sync-knowledge-to-pi.sh
#
# Runs on your local Arch machine. Syncs Anki+Obsidian → knowledge_graph.json,
# then pushes the updated JSON to your Raspberry Pi so the portfolio rebuilds.
#
# Usage:
#   ./scripts/sync-knowledge-to-pi.sh
#
# Environment variables (set in .env or export before running):
#   PI_HOST          - SSH host for your Pi (default: pi)
#   PI_REPO_PATH     - Path to the portfolio repo on the Pi (default: ~/simplistic-portfolio)
#   OBSIDIAN_VAULT_PATH - Path to your Obsidian vault (required for Obsidian enrichment)
#   ANKI_CONNECT_URL - AnkiConnect URL (default: http://127.0.0.1:8765)
#   ANKI_DECK        - Anki deck name (default: Knowledge)
#
# Setup:
#   1. Add your Pi as an SSH host in ~/.ssh/config:
#        Host pi
#          HostName 192.168.x.x   # your Pi's local IP
#          User oleg
#          IdentityFile ~/.ssh/id_ed25519
#
#   2. Make sure the portfolio repo is cloned on the Pi at PI_REPO_PATH
#
#   3. Optional: add a systemd timer or cron job to run this periodically
#      See the systemd unit files below for an example.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env if present
if [[ -f "$REPO_DIR/.env" ]]; then
  set -a
  source "$REPO_DIR/.env"
  set +a
fi

PI_HOST="${PI_HOST:-pi}"
PI_REPO_PATH="${PI_REPO_PATH:-~/simplistic-portfolio}"
PI_APP_SERVICE="${PI_APP_SERVICE:-}"
PI_PM2_PROCESS="${PI_PM2_PROCESS:-}"
DATA_FILE="app/data/knowledge_graph.json"

echo "==> Step 1: Syncing from Anki + Obsidian..."
cd "$REPO_DIR"
node scripts/sync-knowledge.mjs

NODE_COUNT=$(grep -c '"id"' "$DATA_FILE" || true)
LINK_COUNT=$(grep -c '"source"' "$DATA_FILE" || true)
echo "    Generated $NODE_COUNT nodes, $LINK_COUNT links"

echo "==> Step 2: Pushing knowledge_graph.json to $PI_HOST..."
REMOTE_DATA_DIR="$PI_REPO_PATH/app/data"
ssh "$PI_HOST" "mkdir -p $REMOTE_DATA_DIR"
scp "$DATA_FILE" "$PI_HOST:$REMOTE_DATA_DIR/knowledge_graph.json"

echo "==> Step 3: Triggering rebuild on Pi..."
ssh "$PI_HOST" "
  set -e

  if [ -s \"\$HOME/.nvm/nvm.sh\" ]; then
    . \"\$HOME/.nvm/nvm.sh\"
    nvm use --silent default >/dev/null 2>&1 || true
  fi

  cd $PI_REPO_PATH

  NODE_VERSION=\$(node -v | sed 's/^v//')
  NODE_MAJOR=\$(echo \"\$NODE_VERSION\" | cut -d. -f1)
  NODE_MINOR=\$(echo \"\$NODE_VERSION\" | cut -d. -f2)

  if [ \"\$NODE_MAJOR\" -lt 18 ] || { [ \"\$NODE_MAJOR\" -eq 18 ] && [ \"\$NODE_MINOR\" -lt 18 ]; }; then
    echo \"Remote Node.js is too old: v\$NODE_VERSION (need >= 18.18, recommended 20+)\" >&2
    exit 1
  fi

  npm run build
"

if [[ -n "$PI_APP_SERVICE" ]]; then
  echo "==> Step 4: Restarting app service on Pi ($PI_APP_SERVICE)..."
  ssh "$PI_HOST" "systemctl --user restart $PI_APP_SERVICE || sudo systemctl restart $PI_APP_SERVICE"
fi

if [[ -n "$PI_PM2_PROCESS" ]]; then
  echo "==> Step 5: Restarting PM2 app on Pi ($PI_PM2_PROCESS)..."
  ssh "$PI_HOST" "
    set -e
    if [ -s \"\$HOME/.nvm/nvm.sh\" ]; then
      . \"\$HOME/.nvm/nvm.sh\"
      nvm use --silent default >/dev/null 2>&1 || true
    fi
    pm2 restart $PI_PM2_PROCESS
    pm2 save >/dev/null 2>&1 || true
  "
fi

echo "==> Done! Knowledge graph deployed."
