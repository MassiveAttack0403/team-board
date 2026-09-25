# Team Board

Digitales Whiteboard für Abteilungs-Task-Management (13 Personen, Siemens ETM).

## Version: 1.3.3

## Schnellstart ohne Installation (Windows)

Das Team Board kann ohne Node.js, Git oder sonstige Software-Voraussetzungen auf jedem Windows-Rechner direkt ausgeführt werden:

> ⚠️ **WICHTIGER HINWEIS ZUM DOWNLOAD:**  
> Bitte **nicht** die automatisch von GitHub erstellten Links *"Source code (zip)"* (z.B. `team-board-1.2.x.zip`) herunterladen! Diese enthalten nur den reinen Quellcode für Entwickler und benötigen ein installiertes Node.js.  
> Laden Sie ausschließlich die fertige Datei **`team-board-export.zip`** herunter!

1. **ZIP herunterladen:**
   - **[team-board-export.zip herunterladen](https://github.com/MassiveAttack0403/team-board/releases/latest/download/team-board-export.zip)** (~39 MB)
   - *(Alternativ: über die [GitHub Releases-Seite](https://github.com/MassiveAttack0403/team-board/releases/latest))*
2. **Entpacken:**
   - Rechtsklick auf `team-board-export.zip` → **Alle extrahieren...** in einen beliebigen Zielordner (z.B. Desktop oder `C:\TeamBoard`).
3. **Starten:**
   - In den entpackten Ordner wechseln.
   - Doppelklick auf **`start.bat`**.
4. **Fertig:**
   - Ein Konsolenfenster öffnet sich und startet den Server.
   - Nach ca. 4 Sekunden öffnet sich der Browser automatisch unter:
     ```
     http://localhost:3001
     ```
   - Das Konsolenfenster während der Nutzung geöffnet lassen. Zum Beenden das Konsolenfenster schließen.

## Features

- Board: eine Spalte pro Mitarbeiter, Drag & Drop zwischen Spalten
- Tasks anlegen, bearbeiten (Titel / Notizen / Priorität / Fälligkeitsdatum), löschen
- Priorität: sichtbarer "HOCH"-Chip auf der Task-Karte + rote Umrandung
- Fälligkeitsdatum: Farb-Badge auf der Karte (überfällig / heute / bald / normal)
- Abwesenheiten (URLAUB, ZA, KS, OTHER) mit Datumsbereich eintragen und löschen
- **Plan-Kalender** (`/plan`): Consultingplan mit Jahres-Tabs (2024/25–2026/27), 12 einzelne Monatsblöcke untereinander (ein Monat pro Tabelle), 12 Kategorietypen, Ferien-Zeile, CSV-Import & Excel-Export; automatische Spiegelung von Urlauben/Abwesenheiten; Zeitraumauswahl (Multi-Day Range); Wochenend-Toggle, KW-Trennlinien, Typ-Kürzel in Zellen; leere Zellen weiß, österreichische Feiertage automatisch grau; Multi-Tag-Blöcke als colspan; Auto-Scroll auf heute beim Laden; amber Heute-Marker; Tastatur-Shortcut `T`
- **Partnering for Success** (`/partnering`): Tabelle mit 35 Partnerunternehmen in SQLite-Datenbank, farbkodiert nach Status (done=grün / ongoing=gelb), Filter-Buttons, Erstellen & Bearbeiten direkt in der UI
- **Instant Client-Side Navigation**: SPA-Routing ohne Page-Reloads oder Flackern via HTML5 History API
- **Stunden Statistik** (`/stunden`): Horizontales Stacked-Bar-Chart, KW30–KW33, 7 Buchungskategorien
- **SR Statistik** (`/sr`): Platzhalter für Power BI-Integration (Daten von Rainer)
- Team verwalten: Mitarbeiter hinzufügen / entfernen
- Standup-Zusammenfassungen (Copilot-Text + Teams-Link speichern)
- Grid-Layout (umbrechen statt horizontal scrollen)
- Avatar-Kreise mit Initialen pro Person

## Stack

- Frontend: React 18 + @hello-pangea/dnd + Vite (Port 5173)
- Backend: Node.js 22 / Express (Port 3001)
- DB: `node:sqlite` (Node 22 built-in, kein Python/MSVC nötig)
- DB-Datei: `backend/data/board.db` (in .gitignore)

## Quick Start (Ein-Klick)

**Windows:** `start.bat` doppelklicken — installiert alles, seeded DB, öffnet Browser.

**Linux/Mac:** `bash start.sh` — dasselbe vollautomatisch.

Voraussetzung: **Node.js 22+** — https://nodejs.org

## Setup (manuell)

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

## Export auf anderen Rechner (ohne Node.js)

```cmd
build-export.bat
```

Erstellt `team-board-export.zip` (~50–80 MB) mit:
- Node.js 22 portable (kein Install nötig)
- Backend mit pre-installierten node_modules
- Frontend als gebaute statische Dateien
- Pre-seeded Datenbank

Auf dem Zielrechner: ZIP entpacken → `start.bat` doppelklicken → Browser öffnet http://localhost:3001

## Export mit Node.js (Git)

```cmd
git clone https://github.com/MassiveAttack0403/team-board.git
cd team-board
start.bat
```

Voraussetzung: Node.js 22+ installiert.

## Seed (DB neu befüllen)

```cmd
cd backend
npm run seed

# Aug–Sep 2026 Daten aus Whiteboard neu laden
npm run seed-aug-sep
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
