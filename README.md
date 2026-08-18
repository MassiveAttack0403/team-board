# Team Board

Digitales Whiteboard für Abteilungs-Task-Management (13 Personen, Siemens ETM).

## Version: 0.3.0

## Features

- Board: eine Spalte pro Mitarbeiter, Drag & Drop zwischen Spalten
- Tasks anlegen, bearbeiten (Titel/Notizen/Priorität), löschen
- Abwesenheiten (URLAUB, ZA, KS, OTHER) mit Datumsbereich eintragen und löschen
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

## Hosting (Prototyp)

Backend bindet auf `0.0.0.0:3001` — im Siemens-LAN per IP-Adresse des Hosts erreichbar.

## Roadmap

- [ ] Outlook Drag & Drop → Task (Microsoft Graph API, braucht Azure App Registration)
- [ ] Urlaubs-Sync aus Outlook-Kalender (OOO-Einträge automatisch importieren)
- [ ] Azure AD SSO (MSAL)
- [ ] Azure App Service Deployment (Siemens Tenant)
- [ ] Teams-Tab Integration (Board direkt in Teams einbetten)
- [ ] Task-Kommentare / Notizen-Ansicht im Board
- [ ] Priorität / Farb-Label
