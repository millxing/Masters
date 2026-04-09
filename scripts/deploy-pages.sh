#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BASE_PATH_VALUE="${BASE_PATH:-/Masters}"

cd "$ROOT_DIR"
BASE_PATH="$BASE_PATH_VALUE" npm run build:static

touch out/.nojekyll

if [ ! -d out/.git ]; then
  git init out >/dev/null
fi

git -C out branch -M gh-pages
git -C out add .

if git -C out diff --cached --quiet; then
  echo "No gh-pages changes to deploy."
  exit 0
fi

git -C out commit -m "Deploy static site"

if git -C out remote get-url origin >/dev/null 2>&1; then
  git -C out remote set-url origin https://github.com/millxing/Masters.git
else
  git -C out remote add origin https://github.com/millxing/Masters.git
fi

git -C out push -f origin gh-pages
