@echo off
title Team Board — Starter
cd /d "%~dp0"

echo Starting Backend (Port 3001)...
start "Team Board — Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend (Port 5173)...
start "Team Board — Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

timeout /t 3 /nobreak >nul

echo Opening Browser...
start "" "http://localhost:5173"
