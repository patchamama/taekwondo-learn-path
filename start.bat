@echo off
rem Starts the Taekwondo-Learn app (dev server) and opens it in the browser.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required: https://nodejs.org
  pause
  exit /b 1
)
if not exist node_modules call npm install
call npm run dev -- --open
