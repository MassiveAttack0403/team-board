// Version: 0.3.0 — /api/plan routes with multi-day range support, CSV/JSON export & absences mirroring
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

function getDatesInRange(from, to) {
  const dates = [];
  const curr = new Date(from);
  curr.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (curr <= end) {
    const dow = curr.getDay();
    if (dow !== 0 && dow !== 6) { // Weekdays only
      dates.push(curr.toISOString().slice(0, 10));
    }
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

router.get('/holidays', (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });
    const db = getDb();
    const rows = db.prepare(
      'SELECT date, label FROM holiday_entries WHERE date >= ? AND date <= ? ORDER BY date'
    ).all(from, to);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get('/', (req, res, next) => {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ error: 'from and to required' });
    const db = getDb();

    // 1. Hole alle expliziten plan_entries
    const planRows = db.prepare(
      'SELECT * FROM plan_entries WHERE date >= ? AND date <= ? ORDER BY date'
    ).all(from, to);

    const entryMap = new Map();
    for (const r of planRows) {
      entryMap.set(`${r.member_id}:${r.date}`, {
        id: r.id,
        member_id: r.member_id,
        date: r.date,
        type: r.type,
        label: r.label,
        source: 'plan'
      });
    }

    // 2. Spiegel Absences automatisch ein (Typ 'vacation' bzw. 'other_event' für KS)
    // Nur Werktage einspiegeln, wenn noch kein manueller plan_entry existiert oder dieser consulting_blocked ist
    const absences = db.prepare(`
      SELECT member_id, type, date_from, date_to, notes
      FROM absences
      WHERE date_from <= ? AND date_to >= ?
    `).all(to, from);

    for (const a of absences) {
      const start = a.date_from < from ? from : a.date_from;
      const end = a.date_to > to ? to : a.date_to;
      const days = getDatesInRange(start, end);
      const planType = (a.type === 'KS') ? 'other_event' : 'vacation';
      const label = a.type === 'URLAUB' ? (a.notes || null) : (a.type + (a.notes ? ` (${a.notes})` : ''));

      for (const d of days) {
        const key = `${a.member_id}:${d}`;
        const existing = entryMap.get(key);
        // Falls noch kein Eintrag oder reiner Platzhalter (consulting_blocked), durch Urlaub/Abwesenheit überschreiben
        if (!existing || existing.type === 'consulting_blocked') {
          entryMap.set(key, {
            id: existing ? existing.id : null,
            member_id: a.member_id,
            date: d,
            type: planType,
            label: label,
            source: 'absence'
          });
        }
      }
    }

    res.json(Array.from(entryMap.values()));
  } catch (err) {
    next(err);
  }
});

// Bereichseintrag (Multi-Day Range)
router.post('/range', (req, res, next) => {
  try {
    const { memberId, from, to, type, label = null } = req.body;
    if (!memberId || !from || !to || !type) {
      return res.status(400).json({ error: 'memberId, from, to, type required' });
    }
    const days = getDatesInRange(from, to);
    const db = getDb();

    db.exec('BEGIN TRANSACTION');
    try {
      const stmt = db.prepare(`
        INSERT INTO plan_entries (member_id, date, type, label)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(member_id, date) DO UPDATE SET type = excluded.type, label = excluded.label
      `);
      for (const d of days) {
        stmt.run(parseInt(memberId, 10), d, type, label);
      }
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    res.json({ ok: true, count: days.length, days });
  } catch (err) {
    next(err);
  }
});

router.put('/:memberId/:date', (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

router.delete('/:memberId/:date', (req, res, next) => {
  try {
    const { memberId, date } = req.params;
    const db = getDb();
    db.prepare(
      'DELETE FROM plan_entries WHERE member_id = ? AND date = ?'
    ).run(parseInt(memberId, 10), date);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
