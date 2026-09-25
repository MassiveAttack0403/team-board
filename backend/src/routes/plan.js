// Version: 0.4.0 — /api/plan routes mit multi-day range support, CSV import/upload, export & absences mirroring
const express = require('express');
const { getDb } = require('../db');
const router = express.Router();

const MONAT_MAP = {
  'Oktober':   9,
  'November':  10,
  'Dezember':  11,
  'Januar':    0,
  'Februar':   1,
  'März':      2,
  'April':     3,
  'Mai':       4,
  'Juni':      5,
  'Juli':      6,
  'August':    7,
  'September': 8,
};

function inferType(text) {
  if (!text) return 'consulting_blocked';
  const t = text.toLowerCase();
  if (/homeoffice|home office|\bho\b|extended ho/i.test(text)) return 'home_office';
  if (/urlaub|\bza\b|papamonat|papamont|\bu\b/i.test(text)) return 'vacation';
  if (/reha/i.test(text)) return 'other_event';
  if (/\breise\b|\bgrl\b/i.test(text)) return 'travel';
  if (/training|schulung|ttt|workshop|basis/i.test(text)) return 'training_blocked';
  if (/krank/i.test(text)) return 'other_event';
  if (/partner|\buko\b/i.test(text)) return 'partner';
  return 'consulting_blocked';
}

function parseBlocks(content) {
  const lines = content.replace(/\r/g, '').split('\n').map(l => l.split(';'));
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    if ((lines[i][1] || '').trim() === 'Monat') {
      const block = { monatRow: lines[i], wochentagRow: null, kwRow: null, tagRow: null, ferienRow: null, memberRows: [] };
      i++;
      while (i < lines.length) {
        const label = (lines[i][1] || '').trim();
        if (label === 'Monat') break;
        if (lines[i].every(c => !c.trim())) { i++; break; }
        if (label === 'Wochentag') block.wochentagRow = lines[i];
        else if (label === 'KW') block.kwRow = lines[i];
        else if (label === 'Tag') block.tagRow = lines[i];
        else if (label === 'Ferien') block.ferienRow = lines[i];
        else if (label) block.memberRows.push(lines[i]);
        i++;
      }
      blocks.push(block);
    } else {
      i++;
    }
  }
  return blocks;
}

function buildColDateMap(block, fiscalYear) {
  const monatRow = block.monatRow;
  const tagRow = block.tagRow;
  if (!tagRow) return {};
  const monthStarts = [];
  for (let col = 2; col < monatRow.length; col++) {
    const val = (monatRow[col] || '').trim();
    if (val && MONAT_MAP[val] !== undefined) {
      monthStarts.push({ colIdx: col, month: MONAT_MAP[val] });
    }
  }
  if (!monthStarts.length) return {};
  const colDateMap = {};
  for (let col = 2; col < tagRow.length; col++) {
    const dayStr = (tagRow[col] || '').trim();
    if (!dayStr || !/^\d+$/.test(dayStr)) continue;
    const day = parseInt(dayStr, 10);
    if (!day) continue;
    let monthInfo = null;
    for (let m = monthStarts.length - 1; m >= 0; m--) {
      if (col >= monthStarts[m].colIdx) { monthInfo = monthStarts[m]; break; }
    }
    if (!monthInfo) continue;
    const month = monthInfo.month;
    const year = month >= 9 ? fiscalYear : fiscalYear + 1;
    colDateMap[col] = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return colDateMap;
}

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

// CSV-Import / Upload
router.post('/import-csv', (req, res, next) => {
  try {
    const { csvContent, fiscalYear = 2026 } = req.body;
    if (!csvContent) {
      return res.status(400).json({ error: 'csvContent required' });
    }

    const fy = parseInt(fiscalYear, 10);
    const db = getDb();
    const members = db.prepare('SELECT id, name FROM members').all();
    const memberMap = {};
    for (const m of members) memberMap[m.name.trim().toLowerCase()] = m.id;

    const blocks = parseBlocks(csvContent);
    let planCount = 0;
    let holidayCount = 0;
    let skipCount = 0;

    const fromDate = `${fy}-10-01`;
    const toDate = `${fy + 1}-09-30`;

    db.exec('BEGIN TRANSACTION');
    try {
      // Lösche vorherige Plan-Einträge und Feiertage dieses Geschäftsjahres vor Neuimport
      db.prepare('DELETE FROM plan_entries WHERE date >= ? AND date <= ?').run(fromDate, toDate);
      db.prepare('DELETE FROM holiday_entries WHERE date >= ? AND date <= ?').run(fromDate, toDate);

      const insertHolidayStmt = db.prepare('INSERT OR REPLACE INTO holiday_entries (date, label) VALUES (?, ?)');
      const insertPlanStmt = db.prepare('INSERT OR REPLACE INTO plan_entries (member_id, date, type, label) VALUES (?, ?, ?, ?)');

      for (const block of blocks) {
        const colDateMap = buildColDateMap(block, fy);
        if (!Object.keys(colDateMap).length) continue;

        if (block.ferienRow) {
          for (const [col, dateStr] of Object.entries(colDateMap)) {
            const text = (block.ferienRow[col] || '').trim();
            if (!text) continue;
            insertHolidayStmt.run(dateStr, text);
            holidayCount++;
          }
        }

        for (const memberRow of block.memberRows) {
          const rawName = (memberRow[1] || '').trim();
          if (!rawName) continue;
          const memberId = memberMap[rawName.toLowerCase()];
          if (!memberId) {
            skipCount++;
            continue;
          }
          for (const [col, dateStr] of Object.entries(colDateMap)) {
            const text = (memberRow[col] || '').trim();
            if (!text) continue;
            const type = inferType(text);
            insertPlanStmt.run(memberId, dateStr, type, text);
            planCount++;
          }
        }
      }

      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    res.json({
      ok: true,
      fiscalYear: fy,
      importedPlanEntries: planCount,
      importedHolidays: holidayCount,
      skippedMembers: skipCount,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
