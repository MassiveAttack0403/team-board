// Version: 0.1.0
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM standup_summaries ORDER BY meeting_date DESC').all();
  res.json(rows);
});

router.get('/:week', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM standup_summaries WHERE week=?').get(req.params.week);
  if (!row) return res.status(404).json({ error: 'not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { week, meeting_date, summary, source_url } = req.body;
  if (!week || !meeting_date || !summary) return res.status(400).json({ error: 'week, meeting_date, summary required' });
  const db = getDb();
  const result = db.prepare('INSERT INTO standup_summaries (week,meeting_date,summary,source_url) VALUES (?,?,?,?)').run(week, meeting_date, summary, source_url);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM standup_summaries WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
