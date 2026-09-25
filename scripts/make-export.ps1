param()
$ErrorActionPreference = "Stop"

Write-Host "--- Erstelle Export Paket v1.4.0 ---"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
if (-not $root) { $root = Get-Location }

$exportDir = Join-Path $root "_export"
$zipPath = Join-Path $root "team-board-export.zip"

if (Test-Path $exportDir) { Remove-Item $exportDir -Recurse -Force }
New-Item -ItemType Directory -Path $exportDir | Out-Null

# 1. Portable Node finden
$nodeZip = Join-Path $root "node-portable.zip"
if (-not (Test-Path $nodeZip)) {
    $nodeZip = Join-Path $root "node-v22.14.0-win-x64.zip"
}
if (-not (Test-Path $nodeZip)) {
    Write-Host "Lade Node.js v22.14.0 herunter..."
    Invoke-WebRequest -Uri "https://nodejs.org/dist/v22.14.0/node-v22.14.0-win-x64.zip" -OutFile (Join-Path $root "node-v22.14.0-win-x64.zip") -UseBasicParsing
    $nodeZip = Join-Path $root "node-v22.14.0-win-x64.zip"
}

Write-Host "Entpacke Node.js..."
$tmpNode = Join-Path $exportDir "node-tmp"
Expand-Archive -Path $nodeZip -DestinationPath $tmpNode -Force
$firstDir = (Get-ChildItem $tmpNode | Where-Object { $_.PSIsContainer })[0]
Move-Item $firstDir.FullName (Join-Path $exportDir "node")
Remove-Item $tmpNode -Recurse -Force

# 2. Ordnerstruktur aufbauen
$appDir = Join-Path $exportDir "app"
New-Item -ItemType Directory -Path (Join-Path $appDir "src") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $appDir "node_modules") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $appDir "data") -Force | Out-Null
New-Item -ItemType Directory -Path (Join-Path $appDir "public") -Force | Out-Null

# 3. Dateien kopieren
Write-Host "Kopiere Backend & Frontend..."
Copy-Item -Path (Join-Path $root "backend\src\*") -Destination (Join-Path $appDir "src") -Recurse -Force
Copy-Item -Path (Join-Path $root "backend\node_modules\*") -Destination (Join-Path $appDir "node_modules") -Recurse -Force
Copy-Item -Path (Join-Path $root "backend\data\*") -Destination (Join-Path $appDir "data") -Recurse -Force
Copy-Item -Path (Join-Path $root "backend\.env.example") -Destination (Join-Path $appDir ".env.example") -Force
Copy-Item -Path (Join-Path $root "backend\package.json") -Destination (Join-Path $appDir "package.json") -Force
Copy-Item -Path (Join-Path $root "frontend\dist\*") -Destination (Join-Path $appDir "public") -Recurse -Force
Copy-Item -Path (Join-Path $root "scripts\start-portable.bat") -Destination (Join-Path $exportDir "start.bat") -Force
Copy-Item -Path (Join-Path $root "scripts\update.bat") -Destination (Join-Path $exportDir "update.bat") -Force

# 4. ZIP erstellen
Write-Host "Erstelle team-board-export.zip..."
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$exportDir\*" -DestinationPath $zipPath -Force
Remove-Item $exportDir -Recurse -Force

$len = (Get-Item $zipPath).Length
$mb = [math]::Round($len / 1048576, 1)
Write-Host "ERFOLG: team-board-export.zip ($mb MB)"
