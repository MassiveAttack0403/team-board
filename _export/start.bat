@echo off
chcp 65001 >nul
title Team Board

echo.
echo  ===================================
echo   Team Board
echo  ===================================
echo.

set ROOT=%~dp0

:: .env anlegen falls nicht vorhanden
if not exist "%ROOT%app\.env" (
    copy /y "%ROOT%app\.env.example" "%ROOT%app\.env" >nul
    echo  .env angelegt.
)

:: DB seeden falls nicht vorhanden
if not exist "%ROOT%app\data\board.db" (
    echo  Datenbank initialisieren...
    if not exist "%ROOT%app\data" mkdir "%ROOT%app\data"
    "%ROOT%node\node.exe" --experimental-sqlite "%ROOT%app\src\db\seed.js"
)

echo  Starte Team Board auf http://localhost:3001 ...
echo  Browser oeffnet in 4 Sekunden.
echo.
echo  Zum Beenden: Ctrl+C oder dieses Fenster schliessen.
echo.

start "" /B "%ROOT%node\node.exe" --experimental-sqlite "%ROOT%app\src\index.js"

timeout /t 4 /nobreak >nul
start http://localhost:3001

echo  Server laeuft.
pause
