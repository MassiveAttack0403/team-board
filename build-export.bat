@echo off
chcp 65001 >nul
title Team Board — Export Builder

echo.
echo  ============================================
echo   Team Board — Portable Export Builder
echo  ============================================
echo.
echo  Erstellt eine self-contained ZIP die auf
echo  jedem Windows-Rechner (ohne Node.js) laeuft.
echo.

set EXPORT_DIR=%~dp0_export
set ZIP_NAME=%~dp0team-board-export.zip
set NODE_VERSION=22.14.0
set NODE_ZIP=node-v%NODE_VERSION%-win-x64.zip
set NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_ZIP%

:: -------------------------------------------------------
:: 1. Voraussetzungen pruefen
:: -------------------------------------------------------
node --version >nul 2>&1
if errorlevel 1 (
    echo  FEHLER: Node.js nicht gefunden. Auf diesem Build-Rechner wird
    echo         Node.js benoetigt um das Frontend zu bauen.
    pause & exit /b 1
)
npm --version >nul 2>&1
if errorlevel 1 (
    echo  FEHLER: npm nicht gefunden.
    pause & exit /b 1
)
powershell -Command "exit 0" >nul 2>&1
if errorlevel 1 (
    echo  FEHLER: PowerShell nicht verfuegbar.
    pause & exit /b 1
)
echo  Voraussetzungen: OK

:: -------------------------------------------------------
:: 2. Backend Dependencies installieren
:: -------------------------------------------------------
echo.
echo  [1/7] Backend: npm install...
pushd "%~dp0backend"
call npm install --silent
if errorlevel 1 ( echo  FEHLER bei npm install Backend. & popd & pause & exit /b 1 )
popd

:: -------------------------------------------------------
:: 3. Frontend bauen
:: -------------------------------------------------------
echo  [2/7] Frontend: npm install...
pushd "%~dp0frontend"
call npm install --silent
if errorlevel 1 ( echo  FEHLER bei npm install Frontend. & popd & pause & exit /b 1 )

echo  [3/7] Frontend: vite build...
call npm run build
if errorlevel 1 ( echo  FEHLER bei vite build. & popd & pause & exit /b 1 )
popd

:: -------------------------------------------------------
:: 4. DB seeden
:: -------------------------------------------------------
echo  [4/7] Datenbank seeden...
if not exist "%~dp0backend\data" mkdir "%~dp0backend\data"
pushd "%~dp0backend"
call npm run seed
if errorlevel 1 ( echo  FEHLER beim Seeden. & popd & pause & exit /b 1 )
popd

:: -------------------------------------------------------
:: 5. Node.js portable herunterladen
:: -------------------------------------------------------
echo  [5/7] Node.js v%NODE_VERSION% portable herunterladen...
if exist "%~dp0%NODE_ZIP%" (
    echo         Bereits vorhanden — skip.
) else (
    powershell -Command "try { Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%~dp0%NODE_ZIP%' -UseBasicParsing } catch { Write-Error $_.Exception.Message; exit 1 }"
    if errorlevel 1 (
        echo  FEHLER: Download fehlgeschlagen. Internetverbindung pruefen.
        echo  URL: %NODE_URL%
        pause & exit /b 1
    )
)

:: -------------------------------------------------------
:: 6. Export-Verzeichnis aufbauen
:: -------------------------------------------------------
echo  [6/7] Export-Paket zusammenstellen...

if exist "%EXPORT_DIR%" rmdir /s /q "%EXPORT_DIR%"
mkdir "%EXPORT_DIR%"

:: Node.js portable extrahieren
powershell -Command "Expand-Archive -Path '%~dp0%NODE_ZIP%' -DestinationPath '%EXPORT_DIR%\node-tmp' -Force"
:: Umbennen: node-v22.x.x-win-x64 -> node
for /d %%D in ("%EXPORT_DIR%\node-tmp\*") do (
    move "%%D" "%EXPORT_DIR%\node" >nul
)
rmdir "%EXPORT_DIR%\node-tmp" 2>nul

:: Backend kopieren (mit node_modules, ohne .env — wird beim Start angelegt)
mkdir "%EXPORT_DIR%\app"
xcopy /E /I /Y /Q "%~dp0backend\src"          "%EXPORT_DIR%\app\src"          >nul
xcopy /E /I /Y /Q "%~dp0backend\node_modules" "%EXPORT_DIR%\app\node_modules" >nul
xcopy /E /I /Y /Q "%~dp0backend\data"         "%EXPORT_DIR%\app\data"         >nul
copy  /Y           "%~dp0backend\.env.example" "%EXPORT_DIR%\app\.env.example" >nul
copy  /Y           "%~dp0backend\package.json" "%EXPORT_DIR%\app\package.json" >nul

:: Frontend dist in app\public kopieren (wird vom Backend als static serviert)
xcopy /E /I /Y /Q "%~dp0frontend\dist" "%EXPORT_DIR%\app\public" >nul

:: start.bat ins Root schreiben
(
    echo @echo off
    echo chcp 65001 ^>nul
    echo title Team Board
    echo.
    echo echo.
    echo echo  ===================================
    echo echo   Team Board
    echo echo  ===================================
    echo echo.
    echo.
    echo set ROOT=%%~dp0
    echo.
    echo :: .env anlegen falls nicht vorhanden
    echo if not exist "%%ROOT%%app\.env" (
    echo     copy /y "%%ROOT%%app\.env.example" "%%ROOT%%app\.env" ^>nul
    echo     echo  .env angelegt.
    echo )
    echo.
    echo :: DB seeden falls nicht vorhanden
    echo if not exist "%%ROOT%%app\data\board.db" (
    echo     echo  Datenbank initialisieren...
    echo     if not exist "%%ROOT%%app\data" mkdir "%%ROOT%%app\data"
    echo     "%%ROOT%%node\node.exe" --experimental-sqlite "%%ROOT%%app\src\db\seed.js"
    echo )
    echo.
    echo echo  Starte Server auf http://localhost:3001 ...
    echo echo  ^(Browser wird in 4 Sekunden geoeffnet^)
    echo echo.
    echo.
    echo start "" /B "%%ROOT%%node\node.exe" --experimental-sqlite "%%ROOT%%app\src\index.js"
    echo.
    echo timeout /t 4 /nobreak ^>nul
    echo start http://localhost:3001
    echo.
    echo echo  Server laeuft. Dieses Fenster offen lassen.
    echo echo  Zum Beenden: Ctrl+C oder Fenster schliessen.
    echo echo.
    echo pause
) > "%EXPORT_DIR%\start.bat"

:: -------------------------------------------------------
:: 7. ZIP erstellen
:: -------------------------------------------------------
echo  [7/7] ZIP erstellen...
if exist "%ZIP_NAME%" del /f /q "%ZIP_NAME%"
powershell -Command "Compress-Archive -Path '%EXPORT_DIR%\*' -DestinationPath '%ZIP_NAME%' -Force"
if errorlevel 1 ( echo  FEHLER beim Erstellen der ZIP. & pause & exit /b 1 )

:: Temp-Verzeichnis aufraumen
rmdir /s /q "%EXPORT_DIR%"

echo.
echo  ============================================
echo   FERTIG: team-board-export.zip
echo  ============================================
echo.
echo  Auf dem Zielrechner:
echo    1. ZIP entpacken
echo    2. start.bat doppelklicken
echo    3. Fertig — kein Node.js noetig
echo.
echo  Dateigroesse:
powershell -Command "$s=(Get-Item '%ZIP_NAME%').Length; Write-Host ('  ' + [math]::Round($s/1MB,1) + ' MB')"
echo.
pause
