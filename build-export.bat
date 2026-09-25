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

set ROOT=%~dp0
if exist "C:\Program Files\nodejs\node.exe" set "PATH=C:\Program Files\nodejs;%PATH%"
if exist "%LOCALAPPDATA%\Programs\node\node.exe" set "PATH=%LOCALAPPDATA%\Programs\node;%PATH%"
if exist "%USERPROFILE%\AppData\Local\Programs\node\node.exe" set "PATH=%USERPROFILE%\AppData\Local\Programs\node;%PATH%"

where node >nul 2>&1
if errorlevel 1 goto :no_node
where npm >nul 2>&1
if errorlevel 1 goto :no_npm
goto :req_ok

:no_node
echo  FEHLER: Node.js nicht gefunden.
pause & exit /b 1

:no_npm
echo  FEHLER: npm nicht gefunden.
pause & exit /b 1

:req_ok
echo  [1/3] Backend & Frontend Dependencies...
pushd "%ROOT%backend"
call npm install --silent
popd
pushd "%ROOT%frontend"
call npm install --silent
echo  [2/3] Frontend: vite build...
call npm run build
popd

echo  [3/3] Export-Paket packen...
powershell -ExecutionPolicy Bypass -File "%ROOT%scripts\make-export.ps1"

echo.
echo ============================================
echo  FERTIG: team-board-export.zip
echo ============================================
echo.
pause
