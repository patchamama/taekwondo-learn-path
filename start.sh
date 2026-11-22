#!/usr/bin/env bash
# Starts the local audio backend and the app, and opens it in the default browser.
# Works on macOS and Linux (and on Windows inside Git Bash / WSL). On Windows use start.bat.
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20 or newer is required: https://nodejs.org" >&2
  exit 1
fi
if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "Warning: ffmpeg not found. The app works, but MP3 audio needs it: https://ffmpeg.org/download.html" >&2
fi
if [ ! -d node_modules ]; then
  echo "Installing dependencies (first run)..."
  npm install
fi

node server/audio-server.mjs &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT INT TERM

# --open launches the default browser on macOS, Linux and Windows
npm run dev -- --open
