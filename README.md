# Team Board

Digitales Whiteboard für Abteilungs-Task-Management (13 Personen, Siemens ETM).

## Version: 0.7.0

## Features

- Board: eine Spalte pro Mitarbeiter, Drag & Drop zwischen Spalten
- Tasks anlegen, bearbeiten (Titel / Notizen / Priorität / Fälligkeitsdatum), löschen
- Priorität: sichtbarer "HOCH"-Chip auf der Task-Karte + rote Umrandung
- Fälligkeitsdatum: Farb-Badge auf der Karte (überfällig / heute / bald / normal)
- Abwesenheiten (URLAUB, ZA, KS, OTHER) mit Datumsbereich eintragen und löschen
- **Plan-Kalender** (`/plan`): Consultingplan mit Jahres-Tabs (2024/25–2026/27), 6×2-Monats-Blöcke untereinander, 12 Kategorietypen, Ferien-Zeile, CSV-Import; Wochenend-Toggle, KW-Trennlinien, Typ-Kürzel in Zellen
- Team verwalten: Mitarbeiter hinzufügen / entfernen
- Standup-Zusammenfassungen (Copilot-Text + Teams-Link speichern)
- Grid-Layout (umbrechen statt horizontal scrollen)
- Avatar-Kreise mit Initialen pro Person

## Stack

- Frontend: React 18 + @hello-pangea/dnd + Vite (Port 5173)
- Backend: Node.js 22 / Express (Port 3001)
- DB: `node:sqlite` (Node 22 built-in, kein Python/MSVC nötig)
- DB-Datei: `backend/data/board.db` (in .gitignore)

## Setup

```cmd
# Backend (Terminal 1)
cd backend
copy .env.example .env
npm install
npm run dev

# Frontend (Terminal 2)
cd frontend
npm install
npm run dev
```

Dann: http://localhost:5173

## Seed (DB neu befüllen)

```cmd
cd backend
npm run seed
```

## Plan-CSV importieren (Consultingplan aus Excel-Export)

```cmd
cd backend
npm run import-plan              # importiert alle 3 CSVs (2024-25, 2025-26, 2026-27)
npm run import-plan -- --dry-run # Vorschau ohne DB-Schreibzugriff
npm run fill-plan                # füllt leere Werktage aller Jahre mit consulting_blocked
npm run fill-plan -- --dry-run  # Vorschau
npm run fill-plan -- --year 2025 # nur ein Geschäftsjahr befüllen
```

CSVs erwartet in `C:\INCOMING\Consultingplan(20xx-xx).csv` (Windows-1252-kodiert, Semikolon-getrennt).

## Teams-Tab einrichten

1. `teams-manifest/manifest.json` öffnen
2. Alle `REPLACE-WITH-YOUR-DOMAIN` durch die öffentliche URL ersetzen (ngrok / Azure App Service)
3. `REPLACE-WITH-YOUR-APP-GUID` durch eine frische GUID ersetzen (`uuidgen` oder [guidgenerator.com](https://guidgenerator.com))
4. Zwei Icons bereitstellen: `icon-color.png` (192×192px) und `icon-outline.png` (32×32px, weiß auf transparent)
5. Alle 3 Dateien als ZIP paketieren
6. Teams Admin Center → Apps → Custom App hochladen oder direkt per "App hochladen" in Teams installieren

Für lokale Entwicklung: [Microsoft Dev Tunnels](https://learn.microsoft.com/azure/developer/dev-tunnels/) oder ngrok als HTTPS-Tunnel.

## Hosting (Prototyp)

Backend bindet auf `0.0.0.0:3001` — im Siemens-LAN per IP-Adresse des Hosts erreichbar.

## Roadmap

- [x] Plan-Kalender: 6-Monats-Consultingplan mit 12 Kategorietypen, editierbare Zellen
- [ ] Outlook Drag & Drop → Task (Microsoft Graph API, braucht Azure App Registration)
- [ ] Urlaubs-Sync aus Outlook-Kalender (OOO-Einträge automatisch importieren)
- [ ] Azure AD SSO (MSAL)
- [ ] Azure App Service Deployment (Siemens Tenant)
- [ ] Task-Kommentare / Notizen-Ansicht im Board
- [ ] Filter nach Priorität / Fälligkeitsdatum im Board
- [ ] Readonly-/Präsentationsmodus für Standup
