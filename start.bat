:: Version: 1.2.5 — Team Board Dev Starter
@echo off
chcp 65001 >nul
title Team Board — Dev Starter

echo.
echo  ===================================
echo   Team Board — Dev Starter
echo  ===================================
echo.

:: Node.js pruefen
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo  ===================================================================
    echo   HINWEIS: Dies ist das Quellcode-Paket (fuer Entwickler mit Node.js)
    echo  ===================================================================
    echo.
    echo  Node.js wurde auf diesem Computer nicht gefunden.
    echo.
    echo  Fuer die portable Version OHNE Installation von Node.js:
    echo  Bitte laden Sie die fertige Datei 'team-board-export.zip' herunter:
    echo  https://github.com/MassiveAttack0403/team-board/releases/latest
    echo.
    echo  Moechten Sie die Download-Seite jetzt im Browser oeffnen? (J/N)
    set /p OPEN_BROWSER="Auswahl: "
    if /i "%OPEN_BROWSER%"=="J" start https://github.com/MassiveAttack0403/team-board/releases/latest
    echo.
    pause
    exit /b 1
)

for /f "delims=" %%v in ('node -e "process.stdout.write(String(parseInt(process.version.slice(1))))"') do set NODE_MAJOR=%%v
if %NODE_MAJOR% LSS 22 (
    echo  FEHLER: Node.js 22+ benoetigt ^(gefunden: v%NODE_MAJOR%^).
    echo  Bitte aktualisieren: https://nodejs.org
    pause
    exit /b 1
)
echo  Node.js v%NODE_MAJOR% OK

:: Backend npm install
if not exist "backend\node_modules" (
    echo  [1/4] Backend: npm install...
    pushd backend
    call npm install --silent
    popd
) else (
    echo  [1/4] Backend: node_modules vorhanden — skip
)

:: Frontend npm install
if not exist "frontend\node_modules" (
    echo  [2/4] Frontend: npm install...
    pushd frontend
    call npm install --silent
    popd
) else (
    echo  [2/4] Frontend: node_modules vorhanden — skip
)

:: .env anlegen
if not exist "backend\.env" (
    echo  [3/4] .env aus .env.example anlegen...
    copy /y "backend\.env.example" "backend\.env" >nul
) else (
    echo  [3/4] .env vorhanden — skip
)

:: DB seeden
if not exist "backend\data\board.db" (
    echo  [4/4] Datenbank initialisieren...
    if not exist "backend\data" mkdir "backend\data"
    pushd backend
    call npm run seed
    popd
) else (
    echo  [4/4] Datenbank vorhanden — skip
)

echo.
echo  Starte Server...
echo.

:: Backend in neuem Fenster
start "Team Board — Backend ^(Port 3001^)" cmd /k "cd /d "%~dp0backend" && node --experimental-sqlite src/index.js"

:: Kurz warten bis Backend hochgefahren
timeout /t 2 /nobreak >nul

:: Frontend in neuem Fenster
start "Team Board — Frontend ^(Port 5173^)" cmd /k "cd /d "%~dp0frontend" && npx vite"

:: Browser oeffnen
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo  Backend laeuft in: "Team Board - Backend (Port 3001)"
echo  Frontend laeuft in: "Team Board - Frontend (Port 5173)"
echo.
echo  Browser wird geoeffnet: http://localhost:5173
echo.
echo  Zum Beenden: Beide Fenster mit Ctrl+C oder schliessen.
echo.
pause
