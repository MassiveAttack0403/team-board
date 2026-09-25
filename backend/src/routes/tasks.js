// Version: 0.3.0 — /api/tasks routes mit copy-support, color_category und error handling
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const tasks = db.prepare(`
      SELECT t.*, m.name AS member_name
      FROM tasks t JOIN members m ON m.id = t.member_id
      ORDER BY t.member_id, t.position
    `).all();
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const {
      member_id,
      title,
      notes = null,
      priority = 0,
      due_date = null,
      color_category = 'black',
      source = 'manual',
      source_ref = null
    } = req.body;
    if (!member_id || !title) return res.status(400).json({ error: 'member_id + title required' });
    const db = getDb();
    const maxPos = db.prepare('SELECT COALESCE(MAX(position),0)+1 AS p FROM tasks WHERE member_id=?').get(member_id).p;
    const result = db.prepare(
      'INSERT INTO tasks (member_id, title, notes, priority, due_date, color_category, position, source, source_ref) VALUES (?,?,?,?,?,?,?,?,?)'
    ).run(member_id, title, notes, priority, due_date, color_category, maxPos, source, source_ref);
    db.prepare("INSERT INTO audit_log (action,entity,entity_id,payload) VALUES ('create','task',?,?)").run(result.lastInsertRowid, JSON.stringify({ title, member_id }));
    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) {
    next(err);
  }
});

// Task an mehrere Member kopieren
router.post('/:id/copy', (req, res, next) => {
  try {
    const { target_member_ids } = req.body;
    if (!Array.isArray(target_member_ids) || target_member_ids.length === 0) {
      return res.status(400).json({ error: 'target_member_ids array required' });
    }
    const db = getDb();
    const task = db.prepare('SELECT * FROM tasks WHERE id=?').get(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const createdIds = [];
    db.exec('BEGIN TRANSACTION');
    try {
      const getPosStmt = db.prepare('SELECT COALESCE(MAX(position),0)+1 AS p FROM tasks WHERE member_id=?');
      const insertStmt = db.prepare(
        'INSERT INTO tasks (member_id, title, notes, priority, due_date, color_category, position, source, source_ref) VALUES (?,?,?,?,?,?,?,?,?)'
      );
      for (const mId of target_member_ids) {
        const nextPos = getPosStmt.get(mId).p;
        const resInsert = insertStmt.run(
          mId,
          task.title,
          task.notes,
          task.priority,
          task.due_date,
          task.color_category || 'black',
          nextPos,
          'copy',
          `task:${task.id}`
        );
        createdIds.push(resInsert.lastInsertRowid);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    res.status(201).json({ ok: true, count: createdIds.length, created_ids: createdIds });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/move', (req, res, next) => {
  try {
    const { member_id, position } = req.body;
    const db = getDb();
    db.prepare('UPDATE tasks SET member_id=COALESCE(?,member_id), position=COALESCE(?,position), updated_at=datetime(\'now\') WHERE id=?')
      .run(member_id, position, req.params.id);
    db.prepare("INSERT INTO audit_log (action,entity,entity_id,payload) VALUES ('move','task',?,?)").run(req.params.id, JSON.stringify({ member_id, position }));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', (req, res, next) => {
  try {
    const { title = null, notes = null, priority = null, color_category = null } = req.body;
    const hasDueDate = Object.prototype.hasOwnProperty.call(req.body, 'due_date');
    const due_date = hasDueDate ? (req.body.due_date || null) : undefined;
    const db = getDb();
    if (hasDueDate) {
      db.prepare('UPDATE tasks SET title=COALESCE(?,title), notes=COALESCE(?,notes), priority=COALESCE(?,priority), color_category=COALESCE(?,color_category), due_date=?, updated_at=datetime(\'now\') WHERE id=?')
        .run(title, notes, priority, color_category, due_date, req.params.id);
    } else {
      db.prepare('UPDATE tasks SET title=COALESCE(?,title), notes=COALESCE(?,notes), priority=COALESCE(?,priority), color_category=COALESCE(?,color_category), updated_at=datetime(\'now\') WHERE id=?')
        .run(title, notes, priority, color_category, req.params.id);
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const db = getDb();
    db.prepare('DELETE FROM tasks WHERE id=?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
