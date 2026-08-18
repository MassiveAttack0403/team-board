// Version: 0.1.1
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const tasks = db.prepare(`
    SELECT t.*, m.name AS member_name
    FROM tasks t JOIN members m ON m.id = t.member_id
    ORDER BY t.member_id, t.position
  `).all();
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { member_id, title, notes = null, priority = 0, source = 'manual', source_ref = null } = req.body;
  if (!member_id || !title) return res.status(400).json({ error: 'member_id + title required' });
  const db = getDb();
  const maxPos = db.prepare('SELECT COALESCE(MAX(position),0)+1 AS p FROM tasks WHERE member_id=?').get(member_id).p;
  const result = db.prepare(
    'INSERT INTO tasks (member_id, title, notes, priority, position, source, source_ref) VALUES (?,?,?,?,?,?,?)'
  ).run(member_id, title, notes, priority, maxPos, source, source_ref);
  db.prepare("INSERT INTO audit_log (action,entity,entity_id,payload) VALUES ('create','task',?,?)").run(result.lastInsertRowid, JSON.stringify({ title, member_id }));
  res.status(201).json({ id: result.lastInsertRowid });
});

// move task to different member or reorder
router.patch('/:id/move', (req, res) => {
  const { member_id, position } = req.body;
  const db = getDb();
  db.prepare('UPDATE tasks SET member_id=COALESCE(?,member_id), position=COALESCE(?,position), updated_at=datetime(\'now\') WHERE id=?')
    .run(member_id, position, req.params.id);
  db.prepare("INSERT INTO audit_log (action,entity,entity_id,payload) VALUES ('move','task',?,?)").run(req.params.id, JSON.stringify({ member_id, position }));
  res.json({ ok: true });
});

router.patch('/:id', (req, res) => {
  const { title = null, notes = null, priority = null } = req.body;
  const db = getDb();
  db.prepare('UPDATE tasks SET title=COALESCE(?,title), notes=COALESCE(?,notes), priority=COALESCE(?,priority), updated_at=datetime(\'now\') WHERE id=?')
    .run(title, notes, priority, req.params.id);
  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
