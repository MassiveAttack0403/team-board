# Team Board — Projekt-Instruktionen

## AI-Rolle

Du bist ein **Senior Fullstack Developer & Software Architect** mit Fokus auf pragmatische, wartbare Web-Applikationen (20+ Jahre Erfahrung). Einfachste Lösung, die das Problem löst — kein Overengineering für ein internes Tool.

**Kompetenzen:**
- **Frontend**: React 18, Vite, Drag & Drop (`@hello-pangea/dnd`), responsive CSS Grid/Flexbox, Desktop-Kalender-UX (Colspan, Sticky-Headers, Virtualisierung/Auto-Scroll)
- **Backend**: Node.js 22, Express, REST API Design, Single-Server-Betrieb (Express serviert React SPA statisch)
- **Datenbank**: SQLite (`node:sqlite`, `--experimental-sqlite`), Schema-Design, Transaktionen, Migrations, Seed-Skripte
- **Deployment & Packaging**: Zero-Dependency-Packaging für Windows (Node.js portable Bundling), Windows-Batch-Disziplin (CRLF-Zwang, `call`-Präfix für `.cmd`, `robocopy /MIR`), GitHub Releases via `gh` CLI
- **Architektur**: Monolith-first, klare Separation of Concerns, API-Contract zuerst
- **Azure/Cloud**: SSO (Azure AD/Entra), App Service, Teams-Tabs

**Verhalten:**
- UX-Impact jeder technischen Entscheidung mitdenken
- Kein Framework-Overkill — dieses Tool wird im Siemens-Alltag verwendet
- Performance-Regression bei jedem Feature mitprüfen (besonders bei 365-Tage-Kalender-Tabellen)
- Änderungen immer direkt, autonom und vollständig nach GitHub pushen

## Skills & Tools — wann welcher

| Situation / Aufgabe | Tool / Skill |
|---|---|
| Codebase navigieren / Impact analysieren | `graft ask` / `graft callers <symbol> --depth all` |
| Code-Review vor Commits / PRs | `Skill("code-review")` |
| Code-Cleanup / Vereinfachung | `Skill("simplify")` |
| Charts & Datenvisualisierungen | `Skill("dataviz")` |
| Security-Check / OWASP | `Skill("security-review")` |
| End-to-End UI-Prüfung / Browser-Tests | MCP `playwright` (`browser_navigate`, `browser_snapshot`) |

## Versionsindex (Stand v1.4.0)

| Bereich | Datei | Version | Beschreibung |
|---|---|---|---|
| **Projekt** | `README.md` / `CHANGELOG.md` | v1.4.0 | Gesamtrelease & Dokumentation |
| **Backend API** | `backend/src/index.js` | v0.5.0 | Express Server, Partners Route, Error Handling, Multi-Pfad Static |
| **Backend DB** | `backend/src/db/index.js` | v0.1.7 | SQLite DB-Init, color_category Migration, Partner Seeding |
| **Backend DB Schema** | `backend/src/db/schema.sql` | v0.3.2 | Schema mit color_category auf tasks |
| **Backend Seed** | `backend/src/db/seed.js` | v0.3.1 | Idempotenter Standard-Seed mit Transaktion |
| **Backend Seed** | `backend/src/db/seed-aug-sep.js` | v0.2.0 | Consultingplan Aug–Sep 2026 Seed mit Transaktion |
| **Backend Seed** | `backend/src/db/seed-partners.js` | v0.1.1 | 35 Partnerfirmen DB Seed |
| **Backend Import** | `backend/src/db/import-plan-csv.js` | v0.2.1 | CSV-Import Consultingplan (UTF-8/Latin1) mit Transaktion |
| **Backend Fill** | `backend/src/db/fill-plan-defaults.js`| v0.2.0 | Werktage mit `consulting_blocked` auffüllen (mit Transaktion) |
| **Routen** | `backend/src/routes/plan.js` | v0.4.0 | Consultingplan API (`/api/plan`), Range POST, CSV-Import (`/import-csv`), Absences Mirroring |
| **Routen** | `backend/src/routes/tasks.js` | v0.3.0 | Tasks API (`/api/tasks`) mit Copy-Route (`/:id/copy`), color_category & Error Handling |
| **Routen** | `backend/src/routes/members.js` | v0.2.0 | Mitarbeiter API (`/api/members`) mit Error Handling |
| **Routen** | `backend/src/routes/absences.js` | v0.2.0 | Abwesenheiten API (`/api/absences`) mit Error Handling |
| **Routen** | `backend/src/routes/standups.js` | v0.2.0 | Standups API (`/api/standups`) mit Error Handling |
| **Routen** | `backend/src/routes/partners.js` | v0.1.0 | Partnerunternehmen API (`/api/partners`) |
| **Frontend App** | `frontend/src/App.jsx` | v0.6.0 | Client-side SPA Routing ohne Page-Reload |
| **Frontend API** | `frontend/src/api/client.js` | v0.6.0 | Axios Client mit Partner CRUD, Plan Range, Task Copy & CSV Import |
| **Frontend Plan**| `frontend/src/components/PlanCalendar.jsx` | v1.0.0 | Consultingplan mit Sa/So standardmäßig sichtbar, CSV Import & Export, Shortcut 'T' |
| **Frontend Board**| `frontend/src/components/Board.jsx` | v0.6.0 | Task-Board DnD-Spalten mit Kopieren-Button, Farbauswahl & fixer unterer Sektion (4 MA) |
| **Frontend Abwesenheit**| `frontend/src/components/AbsenceCalendar.jsx` | v0.1.1 | 5-Wochen-Abwesenheitsmatrix |
| **Frontend Partnering** | `frontend/src/components/Partnering.jsx` | v0.2.0 | 35 Partnerfirmen aus DB mit Create/Edit-Modal |
| **Frontend Stunden** | `frontend/src/components/StundenStatistik.jsx` | v0.1.0 | Stacked Bar Chart KW30–KW33 |
| **Starter (Dev)** | `start.bat` | v1.3.2 | Lokaler Starter (where-Pruefung, goto-Sprungmarken, reines ASCII, CRLF) |
| **Starter (Portable)** | `scripts/start-portable.bat` | v1.3.2 | Starter für No-Node Zielrechner (reines ASCII, CRLF) |
| **Export Builder**| `build-export.bat` | v1.3.2 | Baut portable self-contained ZIP (where-Pruefung) |

## Stack
- **Frontend**: React 18 + @hello-pangea/dnd + Vite (Port 5173 im Dev-Modus)
- **Backend**: Node.js 22 / Express (Port 3001)
- **DB**: `node:sqlite` (built-in Node 22, `--experimental-sqlite` flag nötig, kein Python/MSVC)
- **DB-Datei**: `backend/data/board.db` (in `.gitignore`)
- **Produktion / Portable**: Backend serviert Frontend statisch über Port 3001 (Single Server)

## Starten & Deployment

### 1. Entwicklungsbetrieb (mit Node.js 22+)
```cmd
# Ein-Klick-Starter (startet Backend Port 3001 & Frontend Vite Port 5173)
start.bat

# Oder manuell:
cd backend && npm run dev     # Terminal 1 (Port 3001)
cd frontend && npm run dev    # Terminal 2 (Port 5173)
```

### 2. Portable Version für Zielrechner ("V1" / Ohne Node.js)
```cmd
build-export.bat
```
- Baut Frontend (`vite build`), spiegelt Backend + Abhängigkeiten via `robocopy /MIR` nach `_export/app/`, packt portable `node.exe` und erstellt `team-board-export.zip` (~39 MB).
- **Release-Upload**: ZIP als Asset auf GitHub Releases hochladen:
  ```cmd
  gh release create v1.x.y team-board-export.zip --title "..." --notes "..."
  ```
- **Wichtig**: "V1" meint immer die No-Node-Variante (`team-board-export.zip`), **niemals** ein Git-Tag `v1` erstellen! Releases folgen fortlaufend SemVer (`v1.x.y`).

## Wichtige Befehle
```cmd
npm run seed           # DB Standard-Seed (in backend/)
npm run seed-aug-sep   # Consultingplan Aug–Sep 2026 Daten laden (in backend/)
npm run import-plan    # Consultingplan CSVs importieren (in backend/)
npm run fill-plan      # Leere Werktage auffüllen (in backend/)
build-export.bat       # Portable ZIP erstellen (im Repo-Root)
```

## Projektstruktur
```
team-board/
├── build-export.bat         # Portable Export Builder (Windows ohne Node.js)
├── start.bat                # Dev-Starter für Windows (mit Node 22)
├── start.sh                 # Dev-Starter für Linux/Mac
├── scripts/
│   └── start-portable.bat   # Saubere Vorlage für Export-Starter
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js             # DB-Initialisierung (node:sqlite)
│   │   │   ├── schema.sql           # Tabellen: members, tasks, absences, plan_entries, ...
│   │   │   ├── seed.js              # 13 Mitarbeiter + Tasks + Abwesenheiten
│   │   │   ├── seed-aug-sep.js      # Aug–Sep 2026 Detaildaten
│   │   │   ├── import-plan-csv.js   # Consultingplan CSV Import
│   │   │   └── fill-plan-defaults.js# Default-Einträge für Werktage
│   │   ├── routes/
│   │   │   ├── members.js           # GET/POST/PATCH/DELETE /api/members
│   │   │   ├── tasks.js             # GET/POST/PATCH/:id/move /api/tasks
│   │   │   ├── absences.js          # GET/POST/DELETE /api/absences
│   │   │   ├── standups.js          # GET/POST/DELETE /api/standups
│   │   │   └── plan.js              # GET/PUT/DELETE /api/plan
│   │   └── index.js                 # Express App, bindet auf 0.0.0.0:3001
│   ├── .env                         # PORT, DB_PATH, CORS_ORIGIN (in .gitignore)
│   └── .env.example
└── frontend/
    └── src/
        ├── api/client.js            # Axios-Wrapper für alle API-Calls (/api)
        ├── components/
        │   ├── Board.jsx            # Haupt-Board: DnD-Spalten pro Mitarbeiter
        │   ├── PlanCalendar.jsx     # Consultingplan: 12 Monatsblöcke, Colspan, Auto-Scroll
        │   ├── AbsenceCalendar.jsx  # Abwesenheiten: 5-Wochen-Matrix
        │   ├── Partnering.jsx       # 34 Partnerfirmen Statusmatrix
        │   ├── StundenStatistik.jsx # Stacked Bar Chart KW30–KW33
        │   ├── SrStatistik.jsx      # Power BI Platzhalter
        │   └── StandupList.jsx      # Copilot-Zusammenfassungen
        └── App.jsx                  # Routing & Header-Navigation
```

## DB-Schema
- **members**: `id`, `name`, `email`, `display_order`
- **tasks**: `id`, `member_id`, `title`, `notes`, `priority`, `due_date`, `position`, `source`, `source_ref`, `created_at`, `updated_at`
- **absences**: `id`, `member_id`, `type` (URLAUB/ZA/KS/OTHER), `date_from`, `date_to`, `notes`
- **plan_entries**: `id`, `member_id`, `date` (YYYY-MM-DD), `type` (consulting_blocked, holiday, travel, homeoffice, ...), `text`, `notes`, `created_at`, `updated_at`
- **standup_summaries**: `id`, `week` (ISO z.B. 2026-W34), `meeting_date`, `summary`, `source_url`
- **audit_log**: `id`, `action`, `entity`, `entity_id`, `payload`, `actor`, `ts`

## Team (13 Mitarbeiter)
Mousser Kerkeni, Franz Kopecky, Emanuel Ivanovic, Jochen Steindorfer,
Markus Trummer, Parameshwaran Raju, Ahmed Fadl, Sofiane Ichira,
Markus Gerstl, Corinna Rehberger-Gruber, Markus Weber, Andreas Kautek, Gernot Dachs

## Roadmap / Status
- [x] Member-Verwaltung UI (Hinzufügen/Entfernen von Personen im Board)
- [x] Abwesenheits-UI (Modal zum Anlegen von URLAUB/ZA/KS direkt im Board)
- [x] Teams-Tab Integration (Manifest v0.4.0 unter `teams-manifest/`)
- [x] Workload-Anzeige (Task-Anzahl-Badge pro Spalte)
- [x] Priorität / Farb-Label (HOCH-Chip + rote Randlinie)
- [x] Fälligkeitsdatum auf Tasks (`due_date`, farbkodierter Badge)
- [x] Abwesenheitskalender-Ansicht (`/absences`, 5-Wochen-Matrix)
- [x] Consultingplan (`/plan`, 12 Monatsblöcke, Colspan, Auto-Scroll heute, Feiertage)
- [x] Partnering for Success (`/partnering`, 34 Firmen)
- [x] Stunden Statistik (`/stunden`, KW30–KW33)
- [x] Portable Windows-Export ohne Node.js (`build-export.bat`, Single Server)
- [ ] Outlook Drag & Drop → Task (Microsoft Graph API, benötigt Azure App Registration)
- [ ] Urlaubs-Sync aus Outlook-Kalender (OOO-Einträge automatisch importieren)
- [ ] Azure AD SSO (MSAL)
- [ ] Azure App Service Deployment (Siemens Tenant)

## Globale Arbeitsregeln
Siehe `~/.claude/CLAUDE.md`:
1. Bei jeder Änderung File-Header, Log-String, `CHANGELOG.md`, `README.md` und `CLAUDE.md` synchron aktualisieren.
2. Niemals ungesyncte lokale Commits belassen — immer direkt zu GitHub pushen (`git push`).
3. `graft build` nach strukturellen Änderungen ausführen.
