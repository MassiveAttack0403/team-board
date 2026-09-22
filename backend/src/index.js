// Version: 0.3.0 — Team Board API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const membersRouter = require('./routes/members');
const tasksRouter = require('./routes/tasks');
const absencesRouter = require('./routes/absences');
const standupsRouter = require('./routes/standups');
const planRouter = require('./routes/plan');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/absences', absencesRouter);
app.use('/api/standups', standupsRouter);
app.use('/api/plan', planRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '0.3.0' }));

// Statisches Frontend servieren wenn public/ vorhanden (Produktions-Export)
const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));
  console.log(`[team-board] Frontend serviert aus ${publicDir}`);
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[team-board] v0.3.0 — API listening on 0.0.0.0:${PORT}`);
});
