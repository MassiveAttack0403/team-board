// Version: 0.1.0 — CSV import for Consultingplan (Windows-1252 encoded)
// Usage: npm run import-plan [-- --dry-run]
const fs = require('fs');
const path = require('path');
const { getDb } = require('./index');

const CSV_FILES = [
  { file: 'C:\\INCOMING\\Consultingplan(2024-25).csv', fiscalYear: 2024 },
  { file: 'C:\\INCOMING\\Consultingplan(2025-26).csv', fiscalYear: 2025 },
  { file: 'C:\\INCOMING\\Consultingplan(2026-27).csv', fiscalYear: 2026 },
];

const DRY_RUN = process.argv.includes('--dry-run');

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
  if (/urlaub|\bza\b|papamont/i.test(text)) return 'vacation';
  if (/reha/i.test(text)) return 'other_event';
  if (/\breise\b|\bgrl\b/i.test(text)) return 'travel';
  if (/training|schulung|ttt|workshop/i.test(text)) return 'training_blocked';
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

function importAll() {
  const db = getDb();
  const members = db.prepare('SELECT id, name FROM members').all();
  const memberMap = {};
  for (const m of members) memberMap[m.name.trim().toLowerCase()] = m.id;

  let planCount = 0, holidayCount = 0, skipCount = 0;

  for (const { file, fiscalYear } of CSV_FILES) {
    if (!fs.existsSync(file)) { console.log(`SKIP: ${file} not found`); continue; }
    const content = fs.readFileSync(file, 'latin1');
    const blocks = parseBlocks(content);
    console.log(`[${fiscalYear}] ${blocks.length} blocks in ${path.basename(file)}`);

    for (const block of blocks) {
      const colDateMap = buildColDateMap(block, fiscalYear);
      if (!Object.keys(colDateMap).length) continue;

      if (block.ferienRow) {
        for (const [col, dateStr] of Object.entries(colDateMap)) {
          const text = (block.ferienRow[col] || '').trim();
          if (!text) continue;
          if (!DRY_RUN) db.prepare('INSERT OR REPLACE INTO holiday_entries (date, label) VALUES (?, ?)').run(dateStr, text);
          console.log(`  holiday ${dateStr}: ${text}`);
          holidayCount++;
        }
      }

      for (const memberRow of block.memberRows) {
        const rawName = (memberRow[1] || '').trim();
        if (!rawName) continue;
        const memberId = memberMap[rawName.toLowerCase()];
        if (!memberId) {
          console.log(`  SKIP member: "${rawName}"`);
          skipCount++;
          continue;
        }
        for (const [col, dateStr] of Object.entries(colDateMap)) {
          const text = (memberRow[col] || '').trim();
          if (!text) continue;
          const type = inferType(text);
          if (!DRY_RUN) db.prepare('INSERT OR REPLACE INTO plan_entries (member_id, date, type, label) VALUES (?, ?, ?, ?)').run(memberId, dateStr, type, text);
          planCount++;
        }
      }
    }
  }

  console.log(`\nDone: ${planCount} plan entries, ${holidayCount} holidays${DRY_RUN ? ' [DRY RUN]' : ''}, ${skipCount} members skipped`);
}

importAll();
