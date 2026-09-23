:: Version: 1.2.4 — Team Board Portable Starter
@echo off
chcp 65001 >nul
title Team Board

echo.
echo  ===================================
echo   Team Board
echo  ===================================
echo.

set ROOT=%~dp0
cd /d "%ROOT%app"

:: .env anlegen falls nicht vorhanden
if not exist ".env" (
    copy /y ".env.example" ".env" >nul
    echo  .env angelegt.
)

:: DB seeden falls nicht vorhanden
if not exist "data\board.db" (
    echo  Datenbank initialisieren...
    if not exist "data" mkdir "data"
    "%ROOT%node\node.exe" --experimental-sqlite "src\db\seed.js"
)

echo  Starte Server auf http://localhost:3001 ...
echo  (Browser wird in 4 Sekunden geoeffnet)
echo.

start "" /B "%ROOT%node\node.exe" --experimental-sqlite "src\index.js"

timeout /t 4 /nobreak >nul
start http://localhost:3001

echo  Server laeuft. Dieses Fenster offen lassen.
echo  Zum Beenden: Fenster schliessen oder Taskmanager.
echo.
pause
