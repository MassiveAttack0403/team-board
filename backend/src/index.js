// Version: 0.2.0 — Team Board API
require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.get('/api/health', (req, res) => res.json({ status: 'ok', version: '0.2.0' }));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[team-board] v0.2.0 — API listening on 0.0.0.0:${PORT}`);
});
