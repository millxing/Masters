#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
INTERVAL_SECONDS="${INTERVAL_SECONDS:-120}"
DB_PATH="${DB_PATH:-$ROOT_DIR/data/db.json}"

while [ "$#" -gt 0 ]; do
  case "$1" in
    --interval)
      if [ "$#" -lt 2 ]; then
        echo "Missing value for --interval" >&2
        exit 1
      fi
      INTERVAL_SECONDS="$2"
      shift 2
      ;;
    --interval=*)
      INTERVAL_SECONDS="${1#*=}"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo "Usage: $0 [--interval SECONDS]" >&2
      exit 1
      ;;
  esac
done

case "$INTERVAL_SECONDS" in
  ''|*[!0-9]*)
    echo "Interval must be a positive integer number of seconds." >&2
    exit 1
    ;;
esac

if [ "$INTERVAL_SECONDS" -le 0 ]; then
  echo "Interval must be greater than 0." >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "Running refresh/deploy loop from $ROOT_DIR every ${INTERVAL_SECONDS}s"
echo "Press Ctrl-C to stop."

while true; do
  before_hash="$(shasum "$DB_PATH" | awk '{print $1}')"

  echo
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting refresh + deploy"
  npm run refresh:espn

  after_hash="$(shasum "$DB_PATH" | awk '{print $1}')"
  if [ "$before_hash" != "$after_hash" ]; then
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Data changed; deploying pages"
    npm run deploy:pages
  else
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Data unchanged; skipping deploy"
  fi

  echo "[$(date '+%Y-%m-%d %H:%M:%S')] Cycle complete; sleeping ${INTERVAL_SECONDS}s"
  sleep "$INTERVAL_SECONDS"
done
