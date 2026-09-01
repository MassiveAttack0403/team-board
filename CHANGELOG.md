# Changelog

## [0.6.1] — 2026-09-01

### Added
- `fill-plan-defaults.js` (v0.1.0): füllt alle Werktage aller 3 Geschäftsjahre mit `consulting_blocked` wo kein Eintrag existiert (`INSERT OR IGNORE`) — setzt den Excel-Default (dunkelblaue Zellen ohne Text) nach
- `npm run fill-plan` (in backend/): 9203 neue Einträge, bestehende bleiben erhalten
- `npm run fill-plan -- --dry-run` und `-- --year 2025` als Flags

## [0.6.0] — 2026-09-01

### Added
- **Plan-Kalender v0.4.0**: 2-Monats-Blöcke untereinander statt 6-Monats-Horizontal-Scrolltabelle
- Jahres-Tabs für Geschäftsjahre 2024/25, 2025/26, 2026/27 (Okt–Sep)
- Ferien-Zeile in jedem 2-Monats-Block (österreichische Schulferien aus CSV)
- Monatstrennlinie zwischen den zwei Monaten in jedem Block (`.plan-month-boundary`)
- `holiday_entries`-Tabelle in DB (`schema.sql` v0.2.1)
- `GET /api/plan/holidays` Endpoint (`plan.js` v0.2.0)
- `getHolidays` in `client.js` (v0.4.0)
- CSV-Import-Script (`import-plan-csv.js` v0.1.0): liest Windows-1252-CSVs, importiert Ferien + Plan-Einträge
  - `npm run import-plan` (in backend/)
  - `npm run import-plan -- --dry-run` für Vorschau ohne DB-Schreibzugriff
- CSS: Jahr-Tab-Leiste (`.plan-year-tabs`), Block-Wrapper (`.plan-block`), Ferien-Zellen (`.plan-th-ferien`, `.plan-ferien-cell`, `.plan-ferien-text`), Monatstrennlinie (`.plan-month-boundary`), zweiter Monats-Header (`.plan-th-month-r`)
- Sticky-Top-Header entfernt (kein globales sticky top auf Kopfzeilen — kollidiert bei gestapelten Blöcken); nur Name-Spalte bleibt sticky-left

## [0.5.2] — 2026-08-19

### Changed
- **Plan-Kalender**: Zellen zeigen nur noch Hintergrundfarbe (kein Label-Text inline) — Details erscheinen beim Klick im Popover (`PlanCalendar.jsx` v0.3.0)

### Fixed
- Plan-Daten befüllt: 983 `plan_entries` für Aug–Nov 2026 direkt in DB eingetragen (seed_plan.js, einmalig ausgeführt)

## [0.5.1] — 2026-08-19

### Added
- **Heute-Markierung im Plan-Kalender**: aktueller Tag wird im Tag-Header (teal Hintergrund) und in den Zellen (teal Outline) hervorgehoben (`isToday` aus date-fns, neue CSS-Klassen `.plan-today-header` und `.plan-today`)
- **Seed-Daten für Plan-Kalender**: Aug–Nov 2026 vollständig befüllt (Urlaub, Consulting geblockt/bestellt, Reise, Schulung, Home Office) — alle 13 Mitarbeiter mit Projektlabels

## [0.5.0] — 2026-08-19

### Added
- **Plan-Kalender** (`/plan`): vollständiger Consultingplan-Kalender mit 12 Kategorietypen (Consulting geblockt/bestellt, Reise, Schulung, Urlaub/ZA, Home Office, Sonstiges, keine Reise, Weiter, Partner), farbkodierten Zellen und editierbaren Feldern
- Klick auf Zelle öffnet Popover: Typ-Auswahl (12 Buttons), optionaler Projekttext, Speichern + Löschen
- 6-Monats-Ansicht mit Navigation (‹/›) und "Heute"-Button
- Monats-, KW-, Wochentag- und Tag-Nummer-Header (alle sticky)
- Wochenenden farblich gedimmt
- Legend-Leiste mit allen 12 Typen oben
- Sticky Name-Spalte links
- `plan_entries`-Tabelle in DB (schema.sql v0.2.0): `member_id, date, type, label, UNIQUE(member_id, date)`
- `GET/PUT/DELETE /api/plan` Routen (`backend/src/routes/plan.js`)
- `getPlan`, `setPlanEntry`, `deletePlanEntry` in `client.js`

### Changed
- Nav-Tab "Kalender" → "Plan", Route `/absences` → `/plan` (AbsenceCalendar entfernt aus Haupt-Nav)
- `backend/src/index.js` v0.2.0: planRouter registriert
- `frontend/src/api/client.js` v0.3.0: Plan-API-Funktionen ergänzt
- `frontend/src/App.jsx` v0.4.0: PlanCalendar importiert, Route `/plan` hinzugefügt

## [0.4.1] — 2026-08-19

### Fixed
- `db/index.js`: `ALTER TABLE ... IF NOT EXISTS` wird von Node.js built-in SQLite nicht unterstützt → try/catch; verhinderte leeres Board beim ersten Seitenaufruf
- Persistente Navigation: Nav jetzt in `App.jsx` — bleibt auf allen Routen sichtbar (Board/Kalender/Standups)
- Aktiver Nav-Link bekommt `nav-active`-Klasse (teal Hintergrund)
- Board-Header (`<header>`) in `Board.jsx` und `AbsenceCalendar.jsx` entfernt; `board-toolbar` Subheader für KW-Label + "Team verwalten"-Button

## [0.4.0] — 2026-08-19

### Added
- **Priorität-Chip**: roter "HOCH"-Chip auf der Task-Karte (statt Dot), rote linke Randlinie
- **Fälligkeitsdatum** (`due_date`): neues Feld in DB (Migration idempotent mit `IF NOT EXISTS`), Task-Modal mit Datums-Input, farbkodierter Badge auf der Karte (überfällig/heute/bald/normal)
- **Abwesenheitskalender** (`/absences`): 5-Wochen-Matrix, Zeilen = Mitarbeiter, Spalten = Werktage, klebende linke Spalte, Farbkodierung nach Abwesenheitstyp, KW-Gruppierung im Header
- **Teams-Tab-Manifest** (`teams-manifest/manifest.json`): statische Tabs Board/Abwesenheiten/Standups, kein Code-Deployment nötig — nur Manifest als ZIP in Teams hochladen
- Nav-Link "Kalender" im Board-Header

### Changed
- Task-Karte: `flex-direction: column` — Priorität + Titel in Top-Row, Due-Badge darunter
- `tasks.js` PATCH: `hasOwnProperty`-Check für `due_date` erlaubt explizites Löschen (null) ohne andere Felder anzufassen

## [0.3.2] — 2026-08-18

### Fixed
- Backend HTTP 500 auf POST /tasks: `node:sqlite` akzeptiert kein `undefined` als Bind-Parameter — `notes`, `source_ref` auf `= null` als Default gesetzt
- Gleiches Fix in routes/absences.js (`notes`), routes/members.js (`email`, `display_order`)
- PATCH /tasks/:id: `title`, `notes`, `priority` ebenfalls auf `= null` defaulted

## [0.3.1] — 2026-08-18

### Fixed
- Task-Speichern: Input jetzt als `useRef` statt State — liest den Wert direkt aus dem DOM, kein Stale-State-Problem mehr
- Buttons nutzen `onMouseDown` + `e.preventDefault()` statt `onClick` — verhindert Focus-Blur-Race vor dem Read
- Sichtbare Fehlermeldung wenn API-Call scheitert oder Titel leer ist

### Changed
- README auf v0.3.1 aktualisiert (Stack, Features, Roadmap)

## [0.3.0] — 2026-08-18

### Fixed
- Task-Speichern-Bug: `<form onSubmit>` statt bare onClick-Button — funktioniert jetzt zuverlässig in allen Browsern/DnD-Contexts
- try/catch in handleAddTask: API-Fehler werden im Console geloggt statt still zu scheitern

### Changed
- Board-Layout: `display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr))` — Spalten umbrechen statt horizontal scrollen
- Design-Overhaul v2: Avatar-Kreise mit Initialen (Farbe pro Person), dunkler Navy-Header mit Teal-Akzent, subtile Hintergrundgradient, animierte Modals (slideUp + fadeIn), verbesserte Card-Shadows und Hover-Effekte, konsistentes CSS-Custom-Properties-System

## [0.2.1] — 2026-08-18

### Fixed
- Task-Speichern-Bug: Inline-Add hat jetzt sichtbaren Speichern-Button (+) und Abbrechen-Button
- Spaltenbreite auf 165px reduziert (war 200-240px)
- Task-Count-Badge wird türkis wenn Tasks vorhanden

### Changed
- Kompletter CSS-Overhaul: kompakteres Design, bessere Schatten, Header mit Gradient, Modals mit Blur-Overlay, Karten mit Hover-Animation

## [0.2.0] — 2026-08-18

### Added
- Task-Edit-Modal: Titel, Notizen und Priorität per Klick auf eine Task-Karte bearbeiten
- Abwesenheits-Modal: pro Spalte "Abw"-Button öffnet Modal zum Eintragen/Löschen von URLAUB/ZA/KS
- Member-Verwaltung: "Team"-Button im Header öffnet Panel zum Hinzufügen und Entfernen von Teammitgliedern
- Workload-Badge: Task-Anzahl pro Spalte im Column-Header
- Notizen-Indikator: kleiner Punkt auf der Task-Karte wenn Notizen vorhanden
- client.js: `createMember`, `deleteMember` ergänzt

## [0.1.0] — 2026-08-18

### Added
- Initiales Projekt-Setup: Backend (Express/SQLite), Frontend (React/Vite)
- REST API: /members, /tasks (inkl. move), /absences, /standups, /health
- Board-UI: spaltenweise Drag & Drop (DnD), Task anlegen per Inline-Input, Doppelklick-Löschen
- Abwesenheits-Badge (URLAUB/ZA/KS) im Column-Header
- Standup-Panel: Copilot-Zusammenfassungen speichern + auflisten
- Audit-Log in DB für Task-Aktionen
- .env.example mit Azure-AD-Platzhaltern für spätere Graph-API-Integration
