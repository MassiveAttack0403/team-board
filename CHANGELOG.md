# Changelog

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
