:: Version: 1.4.0 - Team Board Portable Updater
@echo off
title Team Board - Auto-Updater

echo.
echo ===================================
echo  Team Board - Updater
echo ===================================
echo.

set ROOT=%~dp0
set ZIP_URL=https://github.com/MassiveAttack0403/team-board/releases/latest/download/team-board-export.zip
set TEMP_ZIP=%ROOT%team-board-update.zip
set TEMP_DIR=%ROOT%_update_temp

:: 1. Laufende Node-Instanzen des Team Boards beenden
echo [1/5] Stoppe laufenden Server...
taskkill /f /im node.exe >nul 2>&1
timeout /t 1 /nobreak >nul

:: 2. Datenbank-Backup erstellen
if exist "%ROOT%app\data\board.db" (
    echo [2/5] Sichere Datenbank...
    if not exist "%ROOT%app\data\backups" mkdir "%ROOT%app\data\backups"
    copy /y "%ROOT%app\data\board.db" "%ROOT%app\data\backups\board-backup-%date:~6,4%%date:~3,2%%date:~0,2%.db" >nul
)

:: 3. Neuestes Release herunterladen
echo [3/5] Lade neuestes Update von GitHub herunter...
if exist "%TEMP_ZIP%" del /f /q "%TEMP_ZIP%"
powershell -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '%ZIP_URL%' -OutFile '%TEMP_ZIP%' -UseBasicParsing } catch { Write-Error $_.Exception.Message; exit 1 }"
if errorlevel 1 (
    echo.
    echo  FEHLER: Download fehlgeschlagen. Bitte Internetverbindung pruefen.
    echo  URL: %ZIP_URL%
    echo.
    pause
    exit /b 1
)

:: 4. Update entpacken und anwenden (OHNE board.db zu ueberschreiben)
echo [4/5] Installiere Update...
if exist "%TEMP_DIR%" powershell -Command "Remove-Item -Path '%TEMP_DIR%' -Recurse -Force"
mkdir "%TEMP_DIR%"

powershell -Command "Expand-Archive -Path '%TEMP_ZIP%' -DestinationPath '%TEMP_DIR%' -Force"

:: Kopiere Frontend (public)
if exist "%TEMP_DIR%\app\public" (
    robocopy "%TEMP_DIR%\app\public" "%ROOT%app\public" /E /MIR /NP /NFL /NDL /NJH /NJS >nul
)
:: Kopiere Backend Quellcode (src)
if exist "%TEMP_DIR%\app\src" (
    robocopy "%TEMP_DIR%\app\src" "%ROOT%app\src" /E /MIR /NP /NFL /NDL /NJH /NJS >nul
)
:: Kopiere Backend node_modules falls neu
if exist "%TEMP_DIR%\app\node_modules" (
    robocopy "%TEMP_DIR%\app\node_modules" "%ROOT%app\node_modules" /E /NP /NFL /NDL /NJH /NJS >nul
)
:: Aktualisiere Skripte im Root
if exist "%TEMP_DIR%\start.bat" copy /y "%TEMP_DIR%\start.bat" "%ROOT%start.bat" >nul
if exist "%TEMP_DIR%\update.bat" copy /y "%TEMP_DIR%\update.bat" "%ROOT%update.bat" >nul

:: 5. Aufraeumen
echo [5/5] Raeume temporaere Dateien auf...
if exist "%TEMP_ZIP%" del /f /q "%TEMP_ZIP%"
if exist "%TEMP_DIR%" powershell -Command "Remove-Item -Path '%TEMP_DIR%' -Recurse -Force"

echo.
echo ===================================
echo  Update erfolgreich abgeschlossen!
echo ===================================
echo.
echo Das Team Board kann nun wie gewohnt mit start.bat gestartet werden.
echo.
set /p START_NOW="Moechten Sie das Team Board jetzt direkt starten? (J/N): "
if /i "%START_NOW%"=="J" (
    start "" "%ROOT%start.bat"
)
exit /b 0
