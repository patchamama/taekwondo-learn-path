#!/usr/bin/env bash
# Starts the Taekwondo-Learn app (dev server) and opens it in the browser.
set -e
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required: https://nodejs.org" >&2
  exit 1
fi
[ -d node_modules ] || npm install
npm run dev -- --open
