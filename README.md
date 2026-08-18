# Team Board

Digitales Whiteboard für Abteilungs-Task-Management.

## Version: 0.1.0

## Features (Prototyp)

- Spalten-Board pro Mitarbeiter (Drag & Drop zwischen Spalten)
- Tasks anlegen, verschieben, löschen
- Abwesenheiten (URLAUB, ZA, KS) mit Datumsbereich
- Standup-Zusammenfassungen (Copilot-Text + Teams-Link speichern)

## Stack

- Frontend: React + @hello-pangea/dnd + Vite
- Backend: Node.js / Express
- DB: SQLite (better-sqlite3)

## Setup

```bash
# Backend
cd backend
cp .env.example .env
npm install
npm run dev   # läuft auf :3001

# Frontend (neues Terminal)
cd frontend
npm install
npm run dev   # läuft auf :5173
```

## Hosting (Prototyp)

Backend bindet auf `0.0.0.0:3001` — im Siemens-LAN per IP-Adresse des Hosts erreichbar.

## Roadmap

- [ ] Outlook Drag & Drop → Task (Microsoft Graph API)
- [ ] Urlaubs-Sync aus Outlook-Kalender (OOO-Einträge)
- [ ] Azure AD SSO
- [ ] Azure App Service Deployment
- [ ] Teams-Tab Integration
