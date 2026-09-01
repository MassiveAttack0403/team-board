// Version: 0.1.0 — Fills all weekdays with consulting_blocked where no entry exists
// Usage: npm run fill-plan [-- --dry-run] [-- --year 2024] (default: all 3 fiscal years)
const { getDb } = require('./index');

const DRY_RUN = process.argv.includes('--dry-run');
const YEAR_ARG = (() => { const i = process.argv.indexOf('--year'); return i !== -1 ? parseInt(process.argv[i + 1], 10) : null; })();
const FISCAL_YEARS = YEAR_ARG ? [YEAR_ARG] : [2024, 2025, 2026];

function weekdaysInRange(from, to) {
  const days = [];
  const d = new Date(from);
  d.setHours(0, 0, 0, 0);
  const end = new Date(to);
  while (d <= end) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) {
      days.push(d.toISOString().slice(0, 10));
    }
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function run() {
  const db = getDb();
  const members = db.prepare('SELECT id, name FROM members').all();
  const insertStmt = DRY_RUN ? null : db.prepare(
    'INSERT OR IGNORE INTO plan_entries (member_id, date, type, label) VALUES (?, ?, ?, NULL)'
  );

  let inserted = 0;

  for (const fy of FISCAL_YEARS) {
    const from = `${fy}-10-01`;
    const to   = `${fy + 1}-09-30`;
    const days = weekdaysInRange(from, to);
    console.log(`[${fy}/${fy + 1}] ${days.length} Werktage (${from} – ${to})`);

    for (const m of members) {
      for (const day of days) {
        if (DRY_RUN) { inserted++; continue; }
        const info = insertStmt.run(m.id, day, 'consulting_blocked');
        if (info.changes) inserted++;
      }
    }
  }

  console.log(`\nDone: ${inserted} neue consulting_blocked Einträge${DRY_RUN ? ' [DRY RUN]' : ''}`);
}

run();
