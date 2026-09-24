// Version: 0.1.0 — /api/partners routes
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  try {
    const db = getDb();
    const rows = db.prepare('SELECT * FROM partner_companies ORDER BY name ASC').all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { name, status = 'ongoing', interval = 'quarterly', lang = 'de', premium = '', contact = '', last_meeting = '', link = '' } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });
    const db = getDb();
    const result = db.prepare(`
      INSERT INTO partner_companies (name, status, interval, lang, premium, contact, last_meeting, link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, status, interval, lang, premium, contact, last_meeting, link);
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', (req, res) => {
  try {
    const { name, status, interval, lang, premium, contact, last_meeting, link } = req.body;
    const db = getDb();
    db.prepare(`
      UPDATE partner_companies SET
        name = COALESCE(?, name),
        status = COALESCE(?, status),
        interval = COALESCE(?, interval),
        lang = COALESCE(?, lang),
        premium = COALESCE(?, premium),
        contact = COALESCE(?, contact),
        last_meeting = COALESCE(?, last_meeting),
        link = COALESCE(?, link),
        updated_at = datetime('now')
      WHERE id = ?
    `).run(name, status, interval, lang, premium, contact, last_meeting, link, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM partner_companies WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
