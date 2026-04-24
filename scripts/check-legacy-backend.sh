#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LEGACY_DIR="$ROOT_DIR/backend"
ACTIVE_DIR="$ROOT_DIR/school-task-management/backend"

if [[ ! -d "$LEGACY_DIR" ]]; then
  echo "No top-level legacy backend directory found at: $LEGACY_DIR"
  exit 0
fi

if [[ ! -d "$ACTIVE_DIR" ]]; then
  echo "Active backend directory not found at: $ACTIVE_DIR"
  exit 1
fi

echo "Checking for references to top-level backend/ ..."
MATCHES="$(rg -n --hidden \
  --glob '!.git/**' \
  --glob '!backend/**' \
  --glob '!school-task-management/**' \
  --glob '!scripts/check-legacy-backend.sh' \
  --glob '!**/node_modules/**' \
  '(^|[[:space:]])backend/|\.\./backend(/|\b)|\./backend(/|\b)' "$ROOT_DIR" || true)"

if [[ -n "$MATCHES" ]]; then
  echo
  echo "Potential references found outside school-task-management/. Review before deleting backend/:"
  echo "$MATCHES"
  exit 2
fi

echo "No suspicious references were found outside school-task-management/."
echo "Recommended next step: rename backend -> backend_legacy_backup and re-test."
