// Version: 0.1.0 — Team Board API
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const membersRouter = require('./routes/members');
const tasksRouter = require('./routes/tasks');
const absencesRouter = require('./routes/absences');
const standupsRouter = require('./routes/standups');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

app.use('/api/members', membersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/absences', absencesRouter);
app.use('/api/standups', standupsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '0.1.0' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[team-board] v0.1.0 — API listening on 0.0.0.0:${PORT}`);
});
