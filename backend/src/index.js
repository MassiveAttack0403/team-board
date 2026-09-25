// Version: 0.5.0 — Team Board API
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
const partnersRouter = require('./routes/partners');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/absences', absencesRouter);
app.use('/api/standups', standupsRouter);
app.use('/api/plan', planRouter);
app.use('/api/partners', partnersRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '0.5.0' }));

// Statisches Frontend servieren wenn public/ oder dist/ vorhanden (Produktions-Export oder Dev)
const candidateDirs = [
  path.join(__dirname, '../public'),
  path.join(__dirname, '../../public'),
  path.join(__dirname, '../../frontend/dist'),
  path.join(process.cwd(), 'public'),
  path.join(process.cwd(), 'app/public'),
  path.join(process.cwd(), 'frontend/dist')
];

const publicDir = candidateDirs.find(d => {
  try {
    return fs.existsSync(d) && fs.existsSync(path.join(d, 'index.html'));
  } catch (_) {
    return false;
  }
});

if (publicDir) {
  app.use(express.static(publicDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(publicDir, 'index.html'));
  });
  console.log(`[team-board] Frontend serviert aus ${publicDir}`);
} else {
  console.warn('[team-board] WARNUNG: Kein statisches Frontend gefunden (index.html fehlt).');
  app.get('/', (req, res) => {
    res.status(503).type('html').send(`
      <!DOCTYPE html>
      <html lang="de">
        <head><meta charset="utf-8"><title>Team Board — Frontend nicht gefunden</title></head>
        <body style="font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; line-height: 1.6;">
          <h2 style="color: #ef4444;">Team Board — Frontend nicht gefunden</h2>
          <p>Das statische Web-Frontend (<code>index.html</code>) konnte nicht geladen werden.</p>
          <p>Mögliche Ursachen:</p>
          <ul>
            <li>Der Export wurde unvollständig entpackt (Ordner <code>app/public</code> fehlt).</li>
            <li>Das Frontend wurde noch nicht gebaut (<code>npm run build</code> in <code>frontend/</code>).</li>
          </ul>
          <p>API-Health-Check: <a href="/api/health" style="color: #38bdf8;">/api/health</a></p>
        </body>
      </html>
    `);
  });
}

// Zentraler Error-Handler
app.use((err, req, res, next) => {
  console.error('[team-board] API Error:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[team-board] v0.5.0 — API listening on 0.0.0.0:${PORT}`);
});
