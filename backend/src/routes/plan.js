// Version: 0.2.0 — /api/plan routes
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/holidays', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  const db = getDb();
  const rows = db.prepare(
    'SELECT date, label FROM holiday_entries WHERE date >= ? AND date <= ? ORDER BY date'
  ).all(from, to);
  res.json(rows);
});

router.get('/', (req, res) => {
  const { from, to } = req.query;
  if (!from || !to) return res.status(400).json({ error: 'from and to required' });
  const db = getDb();
  const rows = db.prepare(
    'SELECT * FROM plan_entries WHERE date >= ? AND date <= ? ORDER BY date'
  ).all(from, to);
  res.json(rows);
});

router.put('/:memberId/:date', (req, res) => {
  const { memberId, date } = req.params;
  const { type, label = null } = req.body;
  if (!type) return res.status(400).json({ error: 'type required' });
  const db = getDb();
  db.prepare(`
    INSERT INTO plan_entries (member_id, date, type, label)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(member_id, date) DO UPDATE SET type = excluded.type, label = excluded.label
  `).run(parseInt(memberId, 10), date, type, label);
  res.json({ ok: true });
});

router.delete('/:memberId/:date', (req, res) => {
  const { memberId, date } = req.params;
  const db = getDb();
  db.prepare(
    'DELETE FROM plan_entries WHERE member_id = ? AND date = ?'
  ).run(parseInt(memberId, 10), date);
  res.json({ ok: true });
});

module.exports = router;
