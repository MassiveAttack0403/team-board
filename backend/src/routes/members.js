// Version: 0.1.1
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const members = db.prepare('SELECT * FROM members ORDER BY display_order').all();
  res.json(members);
});

router.post('/', (req, res) => {
  const { name, email = null, display_order = 0 } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const db = getDb();
  const result = db.prepare('INSERT INTO members (name, email, display_order) VALUES (?,?,?)').run(name, email, display_order);
  res.status(201).json({ id: result.lastInsertRowid });
});

router.patch('/:id', (req, res) => {
  const { name = null, email = null, display_order = null } = req.body;
  const db = getDb();
  db.prepare('UPDATE members SET name=COALESCE(?,name), email=COALESCE(?,email), display_order=COALESCE(?,display_order) WHERE id=?')
    .run(name, email, display_order, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM members WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
