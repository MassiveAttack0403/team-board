:: Version: 1.4.0 - Team Board Portable Export Builder
@echo off
title Team Board - Export Builder

echo.
echo ============================================
echo  Team Board - Portable Export Builder v1.4.0
echo ============================================
echo.
echo  Erstellt eine self-contained ZIP die auf
echo  jedem Windows-Rechner (ohne Node.js) laeuft.
echo.

set EXPORT_DIR=%~dp0_export
set ZIP_NAME=%~dp0team-board-export.zip
set NODE_VERSION=22.14.0
set NODE_ZIP=node-v%NODE_VERSION%-win-x64.zip
set NODE_URL=https://nodejs.org/dist/v%NODE_VERSION%/%NODE_ZIP%

:: Standard-Node.js Pfade zum PATH hinzufuegen falls nicht vorhanden
if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%"
if exist "%USERPROFILE%\AppData\Local\Programs\node\node.exe" set "PATH=%USERPROFILE%\AppData\Local\Programs\node;%PATH%"

:: -------------------------------------------------------
:: 1. Voraussetzungen pruefen
:: -------------------------------------------------------
where node >nul 2>&1
if errorlevel 1 (
    echo  FEHLER: Node.js nicht gefunden. Auf diesem Build-Rechner wird
    echo         Node.js benoetigt um das Frontend zu bauen.
    pause & exit /b 1
)
where npm >nul 2>&1
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
:: 5. Node.js portable bereitstellen
:: -------------------------------------------------------
echo  [5/7] Node.js portable bereitstellen...
set "ACTUAL_NODE_ZIP="
if exist "%~dp0node-portable.zip" (
    set "ACTUAL_NODE_ZIP=%~dp0node-portable.zip"
    echo         node-portable.zip vorhanden - verwende lokales Archiv.
) else if exist "%~dp0%NODE_ZIP%" (
    set "ACTUAL_NODE_ZIP=%~dp0%NODE_ZIP%"
    echo         %NODE_ZIP% vorhanden - verwende lokales Archiv.
) else (
    echo         Lade Node.js v%NODE_VERSION% herunter...
    powershell -Command "try { Invoke-WebRequest -Uri '%NODE_URL%' -OutFile '%~dp0%NODE_ZIP%' -UseBasicParsing } catch { Write-Error $_.Exception.Message; exit 1 }"
    if errorlevel 1 (
        echo  FEHLER: Download fehlgeschlagen. Internetverbindung pruefen.
        echo  URL: %NODE_URL%
        pause & exit /b 1
    )
    set "ACTUAL_NODE_ZIP=%~dp0%NODE_ZIP%"
)

:: -------------------------------------------------------
:: 6. Export-Verzeichnis aufbauen
:: -------------------------------------------------------
echo  [6/7] Export-Paket zusammenstellen...

if exist "%EXPORT_DIR%" (
    powershell -Command "if (Test-Path '%EXPORT_DIR%') { Remove-Item -Path '%EXPORT_DIR%' -Recurse -Force }"
)
mkdir "%EXPORT_DIR%"

:: Node.js portable extrahieren
powershell -Command "Expand-Archive -Path '%ACTUAL_NODE_ZIP%' -DestinationPath '%EXPORT_DIR%\node-tmp' -Force"
for /d %%D in ("%EXPORT_DIR%\node-tmp\*") do (
    move "%%D" "%EXPORT_DIR%\node" >nul
)
rmdir "%EXPORT_DIR%\node-tmp" 2>nul

:: Backend kopieren (/MIR sichert saubere Ordner ohne Altlasten)
mkdir "%EXPORT_DIR%\app\src"
robocopy "%~dp0backend\src"          "%EXPORT_DIR%\app\src"          /E /MIR /NP /NFL /NDL /NJH /NJS >nul
mkdir "%EXPORT_DIR%\app\node_modules"
robocopy "%~dp0backend\node_modules" "%EXPORT_DIR%\app\node_modules" /E /MIR /NP /NFL /NDL /NJH /NJS >nul
mkdir "%EXPORT_DIR%\app\data"
robocopy "%~dp0backend\data"         "%EXPORT_DIR%\app\data"         /E /MIR /NP /NFL /NDL /NJH /NJS >nul
copy  /Y "%~dp0backend\.env.example" "%EXPORT_DIR%\app\.env.example" >nul
copy  /Y "%~dp0backend\package.json" "%EXPORT_DIR%\app\package.json" >nul

:: Frontend dist in app\public kopieren (wird vom Backend als static serviert)
mkdir "%EXPORT_DIR%\app\public"
robocopy "%~dp0frontend\dist" "%EXPORT_DIR%\app\public" /E /MIR /NP /NFL /NDL /NJH /NJS >nul

:: start.bat und update.bat ins Export-Root kopieren
copy /Y "%~dp0scripts\start-portable.bat" "%EXPORT_DIR%\start.bat" >nul
copy /Y "%~dp0scripts\update.bat" "%EXPORT_DIR%\update.bat" >nul

:: -------------------------------------------------------
:: 7. ZIP erstellen
:: -------------------------------------------------------
echo  [7/7] ZIP erstellen...
if exist "%ZIP_NAME%" del /f /q "%ZIP_NAME%"
powershell -Command "Compress-Archive -Path '%EXPORT_DIR%\*' -DestinationPath '%ZIP_NAME%' -Force"
if errorlevel 1 ( echo  FEHLER beim Erstellen der ZIP. & pause & exit /b 1 )

:: Temp-Verzeichnis aufraumen
powershell -Command "if (Test-Path '%EXPORT_DIR%') { Remove-Item -Path '%EXPORT_DIR%' -Recurse -Force }"

echo.
echo  ============================================
echo   FERTIG: team-board-export.zip
echo  ============================================
echo.
echo  Auf dem Zielrechner:
echo    1. ZIP entpacken
echo    2. start.bat doppelklicken
echo    3. Fertig - kein Node.js noetig
echo.
echo  Dateigroesse:
powershell -Command "$s=(Get-Item '%ZIP_NAME%').Length; Write-Host ('  ' + [math]::Round($s/1MB,1) + ' MB')"
echo.
