#!/usr/bin/env bash
set -e

echo ""
echo " ==================================="
echo "  Team Board — Starter"
echo " ==================================="
echo ""

# Node.js pruefen
if ! command -v node &>/dev/null; then
    echo " FEHLER: Node.js nicht gefunden. Bitte Node.js 22+ installieren."
    exit 1
fi

NODE_MAJOR=$(node -e "process.stdout.write(String(parseInt(process.version.slice(1))))")
if [ "$NODE_MAJOR" -lt 22 ]; then
    echo " FEHLER: Node.js 22+ benoetigt (gefunden: v$NODE_MAJOR)."
    exit 1
fi
echo " Node.js v$NODE_MAJOR OK"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Backend npm install
if [ ! -d "$SCRIPT_DIR/backend/node_modules" ]; then
    echo " [1/4] Backend: npm install..."
    (cd "$SCRIPT_DIR/backend" && npm install --silent)
else
    echo " [1/4] Backend: node_modules vorhanden — skip"
fi

# Frontend npm install
if [ ! -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo " [2/4] Frontend: npm install..."
    (cd "$SCRIPT_DIR/frontend" && npm install --silent)
else
    echo " [2/4] Frontend: node_modules vorhanden — skip"
fi

# .env anlegen
if [ ! -f "$SCRIPT_DIR/backend/.env" ]; then
    echo " [3/4] .env aus .env.example anlegen..."
    cp "$SCRIPT_DIR/backend/.env.example" "$SCRIPT_DIR/backend/.env"
else
    echo " [3/4] .env vorhanden — skip"
fi

# DB seeden
if [ ! -f "$SCRIPT_DIR/backend/data/board.db" ]; then
    echo " [4/4] Datenbank initialisieren..."
    mkdir -p "$SCRIPT_DIR/backend/data"
    (cd "$SCRIPT_DIR/backend" && npm run seed)
else
    echo " [4/4] Datenbank vorhanden — skip"
fi

echo ""
echo " Starte Server..."
echo ""

# Backend starten
(cd "$SCRIPT_DIR/backend" && node --experimental-sqlite src/index.js) &
BACKEND_PID=$!

sleep 2

# Frontend starten
(cd "$SCRIPT_DIR/frontend" && npx vite) &
FRONTEND_PID=$!

sleep 3

# Browser oeffnen (plattformabhaengig)
if command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:5173
elif command -v open &>/dev/null; then
    open http://localhost:5173
fi

echo " Backend PID: $BACKEND_PID  (http://localhost:3001)"
echo " Frontend PID: $FRONTEND_PID  (http://localhost:5173)"
echo ""
echo " Zum Beenden: Ctrl+C"
echo ""

# Warten auf Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ' Server gestoppt.'" EXIT
wait
