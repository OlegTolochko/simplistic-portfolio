#!/usr/bin/env bash
#
# sync-knowledge-to-pi.sh
#
# Runs on your local Arch machine. Syncs Anki+Obsidian → knowledge_graph.json,
# then pushes the updated JSON to your Raspberry Pi. No rebuild needed — the
# file is served from public/data/ and fetched at runtime by the client.
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
DATA_FILE="public/data/knowledge_graph.json"

echo "==> Step 1: Syncing from Anki + Obsidian..."
cd "$REPO_DIR"
node scripts/sync-knowledge.mjs

NODE_COUNT=$(grep -c '"id"' "$DATA_FILE" || true)
LINK_COUNT=$(grep -c '"source"' "$DATA_FILE" || true)
echo "    Generated $NODE_COUNT nodes, $LINK_COUNT links"

echo "==> Step 2: Pushing knowledge_graph.json to $PI_HOST..."
REMOTE_DATA_DIR="$PI_REPO_PATH/public/data"
ssh "$PI_HOST" "mkdir -p $REMOTE_DATA_DIR"
scp "$DATA_FILE" "$PI_HOST:$REMOTE_DATA_DIR/knowledge_graph.json"

echo "==> Done! Knowledge graph data deployed (no rebuild needed)."
