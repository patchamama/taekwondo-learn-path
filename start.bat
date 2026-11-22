@echo off
rem Starts the local audio backend and the app, and opens it in the default browser (Windows).
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 20 or newer is required: https://nodejs.org
  pause
  exit /b 1
)
where ffmpeg >nul 2>nul
if errorlevel 1 echo Warning: ffmpeg not found. The app works, but MP3 audio needs it: https://ffmpeg.org/download.html

if not exist node_modules (
  echo Installing dependencies ^(first run^)...
  call npm install
)

rem The backend runs in its own window; close it when you are done.
start "Taekwondo audio server" node server\audio-server.mjs

rem --open launches the default browser
call npm run dev -- --open
