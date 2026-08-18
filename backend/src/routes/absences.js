// Version: 0.1.0
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare(`
    SELECT a.*, m.name AS member_name
    FROM absences a JOIN members m ON m.id = a.member_id
    ORDER BY a.date_from
  `).all();
  res.json(rows);
});

router.post('/', (req, res) => {
  const { member_id, type, date_from, date_to, notes } = req.body;
  if (!member_id || !type || !date_from || !date_to) return res.status(400).json({ error: 'member_id, type, date_from, date_to required' });
  const db = getDb();
  const result = db.prepare('INSERT INTO absences (member_id,type,date_from,date_to,notes) VALUES (?,?,?,?,?)').run(member_id, type, date_from, date_to, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM absences WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
