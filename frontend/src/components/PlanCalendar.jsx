// Version: 0.7.0
import React, { useEffect, useState, useRef } from 'react';
import { getMembers, getPlan, getHolidays, setPlanEntry, deletePlanEntry } from '../api/client';
import { endOfMonth, addDays, format, getISOWeek, isToday } from 'date-fns';

// Austrian national public holidays (Gesetzliche Feiertage) — static for fiscal years 2024-2027
// Easter: 2024=Mar31, 2025=Apr20, 2026=Apr5, 2027=Mar28
const AT_HOLIDAYS = new Set([
  // 2024
  '2024-01-01','2024-01-06','2024-04-01','2024-05-01','2024-05-09','2024-05-19','2024-05-30',
  '2024-08-15','2024-10-26','2024-11-01','2024-12-08','2024-12-25','2024-12-26',
  // 2025
  '2025-01-01','2025-01-06','2025-04-21','2025-05-01','2025-05-29','2025-06-08','2025-06-19',
  '2025-08-15','2025-10-26','2025-11-01','2025-12-08','2025-12-25','2025-12-26',
  // 2026
  '2026-01-01','2026-01-06','2026-04-06','2026-05-01','2026-05-14','2026-05-24','2026-06-04',
  '2026-08-15','2026-10-26','2026-11-01','2026-12-08','2026-12-25','2026-12-26',
  // 2027
  '2027-01-01','2027-01-06','2027-03-29','2027-05-01','2027-05-06','2027-05-16','2027-05-27',
  '2027-08-15','2027-10-26','2027-11-01','2027-12-08','2027-12-25','2027-12-26',
]);

const PLAN_TYPES = [
  { key: 'consulting_blocked', label: 'Consulting geblockt',     code: '',      bg: '#1e3a8a', fg: '#fff' },
  { key: 'consulting_ordered', label: 'Consulting bestellt',     code: 'Best.', bg: '#fef08a', fg: '#333' },
  { key: 'planned_ice',        label: 'Verplant Eis',            code: 'Eis',   bg: '#9333ea', fg: '#fff' },
  { key: 'travel',             label: 'Reise',                   code: 'Reise', bg: '#86efac', fg: '#14532d' },
  { key: 'training_blocked',   label: 'Schulung geblockt',       code: 'Sch.',  bg: '#f97316', fg: '#fff' },
  { key: 'training_ordered',   label: 'Schulung bestellt (fix)', code: 'Sch!',  bg: '#16a34a', fg: '#fff' },
  { key: 'vacation',           label: 'Urlaub / ZA',             code: 'URL',   bg: '#3b82f6', fg: '#fff' },
  { key: 'home_office',        label: 'Home Office',             code: 'HO',    bg: '#fca5a5', fg: '#7f1d1d' },
  { key: 'other_event',        label: 'Sonstiges Event',         code: 'Evt',   bg: '#67e8f9', fg: '#0c4a6e' },
  { key: 'no_travel',          label: 'keine Reise möglich',     code: 'kR',    bg: '#f472b6', fg: '#fff' },
  { key: 'continue',           label: 'Weiter',                  code: 'Wtr',   bg: '#0f766e', fg: '#fff' },
  { key: 'partner',            label: 'Partner',                 code: 'Part',  bg: '#c4b5fd', fg: '#4c1d95' },
];

const TYPE_MAP = Object.fromEntries(PLAN_TYPES.map(t => [t.key, t]));
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTH_NAMES = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
const FISCAL_YEARS = [2024, 2025, 2026];
const BLOCK_DEFS = [[9,10],[11,0],[1,2],[3,4],[5,6],[7,8]];

function ds(d) { return format(d, 'yyyy-MM-dd'); }
function isWE(d) { const w = d.getDay(); return w === 0 || w === 6; }

function monthDates(year, month) {
  const end = endOfMonth(new Date(year, month, 1));
  const out = [];
  let d = new Date(year, month, 1);
  while (d <= end) { out.push(new Date(d)); d = addDays(d, 1); }
  return out;
}

function kwGroups(dates) {
  const groups = [];
  let cur = null;
  for (const d of dates) {
    const kw = getISOWeek(d);
    const key = `${d.getFullYear()}-${kw}`;
    if (!cur || cur.key !== key) { cur = { key, number: kw, days: [] }; groups.push(cur); }
    cur.days.push(d);
  }
  return groups;
}

function kwBoundarySet(dates) {
  const set = new Set();
  let lastKey = null;
  dates.forEach((d, i) => {
    const key = `${d.getFullYear()}-${getISOWeek(d)}`;
    if (key !== lastKey) { set.add(i); lastKey = key; }
  });
  return set;
}

function getBlockData(fiscalYear, [m1, m2]) {
  const y1 = m1 >= 9 ? fiscalYear : fiscalYear + 1;
  const y2 = m2 >= 9 ? fiscalYear : fiscalYear + 1;
  return { dates1: monthDates(y1, m1), dates2: monthDates(y2, m2), y1, y2, m1, m2 };
}

export default function PlanCalendar() {
  const [fiscalYear, setFiscalYear] = useState(() => {
    const now = new Date();
    return now.getMonth() >= 9 ? now.getFullYear() : now.getFullYear() - 1;
  });
  const [hideWeekends, setHideWeekends] = useState(true);
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState({});
  const [holidays, setHolidays] = useState({});
  const [popover, setPopover] = useState(null);
  const popRef = useRef(null);

  const fromStr = `${fiscalYear}-10-01`;
  const toStr   = `${fiscalYear + 1}-09-30`;

  useEffect(() => { getMembers().then(setMembers); }, []);

  useEffect(() => {
    getPlan(fromStr, toStr).then(rows => {
      const map = {};
      for (const r of rows) map[`${r.member_id}:${r.date}`] = { type: r.type, label: r.label || '' };
      setEntries(map);
    });
    getHolidays(fromStr, toStr).then(rows => {
      const map = {};
      for (const r of rows) map[r.date] = r.label;
      setHolidays(map);
    });
  }, [fromStr, toStr]);

  useEffect(() => {
    if (!popover) return;
    const close = e => { if (popRef.current && !popRef.current.contains(e.target)) setPopover(null); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [popover]);

  const openCell = (memberId, dateStr, rect) => {
    const ex = entries[`${memberId}:${dateStr}`];
    setPopover({
      memberId, dateStr,
      type:  ex?.type  || PLAN_TYPES[0].key,
      label: ex?.label || '',
      x: Math.min(rect.left, window.innerWidth - 280),
      y: Math.min(rect.bottom + 4, window.innerHeight - 270),
    });
  };

  const saveCell = async () => {
    const { memberId, dateStr, type, label } = popover;
    await setPlanEntry(memberId, dateStr, { type, label: label || null });
    setEntries(prev => ({ ...prev, [`${memberId}:${dateStr}`]: { type, label } }));
    setPopover(null);
  };

  const clearCell = async () => {
    const { memberId, dateStr } = popover;
    await deletePlanEntry(memberId, dateStr);
    setEntries(prev => { const n = { ...prev }; delete n[`${memberId}:${dateStr}`]; return n; });
    setPopover(null);
  };

  return (
    <div className="plan-wrap">
      <div className="plan-year-tabs">
        {FISCAL_YEARS.map(fy => (
          <button
            key={fy}
            className={`plan-year-tab${fiscalYear === fy ? ' active' : ''}`}
            onClick={() => setFiscalYear(fy)}
          >
            {fy}/{String(fy + 1).slice(2)}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button
          className={`plan-we-toggle${hideWeekends ? ' active' : ''}`}
          onClick={() => setHideWeekends(v => !v)}
          title="Samstag / Sonntag ein- oder ausblenden"
        >
          Sa/So {hideWeekends ? 'ausgeblendet' : 'sichtbar'}
        </button>
      </div>

      <div className="plan-legend">
        {PLAN_TYPES.map(t => (
          <span key={t.key} className="plan-legend-chip" style={{ background: t.bg, color: t.fg }}>{t.label}</span>
        ))}
      </div>

      <div className="plan-scroll">
        {BLOCK_DEFS.map((blockDef, blockIdx) => {
          const { dates1, dates2, y1, y2, m1, m2 } = getBlockData(fiscalYear, blockDef);
          const fd1 = hideWeekends ? dates1.filter(d => !isWE(d)) : dates1;
          const fd2 = hideWeekends ? dates2.filter(d => !isWE(d)) : dates2;
          const allDates = [...fd1, ...fd2];
          const kws = kwGroups(allDates);
          const kwBounds = kwBoundarySet(allDates);

          const cls = (d, i, extra = '') => {
            let c = extra;
            const dstr = ds(d);
            if (AT_HOLIDAYS.has(dstr)) c += ' plan-holiday';
            else if (isWE(d)) c += ' plan-we';
            if (i === fd1.length) c += ' plan-month-boundary';
            else if (kwBounds.has(i) && i > 0) c += ' plan-kw-boundary';
            return c.trim();
          };

          return (
            <div key={blockIdx} className="plan-block">
              <table className="plan-table">
                <thead>
                  <tr>
                    <th className="plan-name-th plan-th-month">Name</th>
                    <th colSpan={fd1.length} className="plan-th-month">{MONTH_NAMES[m1]} {y1}</th>
                    <th colSpan={fd2.length} className="plan-th-month plan-th-month-r">{MONTH_NAMES[m2]} {y2}</th>
                  </tr>
                  <tr>
                    <th className="plan-name-th plan-th-kw" />
                    {kws.map(g => (
                      <th key={g.key} colSpan={g.days.length} className="plan-th-kw">KW {g.number}</th>
                    ))}
                  </tr>
                  <tr>
                    <th className="plan-name-th plan-th-wd" />
                    {allDates.map((d, i) => (
                      <th key={i} className={cls(d, i, 'plan-th-wd')}>{WD[d.getDay()]}</th>
                    ))}
                  </tr>
                  <tr>
                    <th className="plan-name-th plan-th-day" />
                    {allDates.map((d, i) => (
                      <th key={i} className={cls(d, i, `plan-th-day${isToday(d) ? ' plan-today-header' : ''}`)}>{d.getDate()}</th>
                    ))}
                  </tr>
                  <tr>
                    <th className="plan-name-th plan-th-ferien">Ferien</th>
                    {allDates.map((d, i) => {
                      const hol = holidays[ds(d)];
                      return (
                        <th key={i} className={cls(d, i, 'plan-ferien-cell')} title={hol || ''}>
                          {hol ? <span className="plan-ferien-text">{hol}</span> : null}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {members.map((m, rowIdx) => {
                    // Group consecutive same-type+label cells into segments for colspan rendering.
                    // Break at: holiday, empty cell, month boundary (fd1.length), type or label change.
                    const segs = [];
                    let idx = 0;
                    while (idx < allDates.length) {
                      const d = allDates[idx];
                      const dstr = ds(d);
                      const isHol = AT_HOLIDAYS.has(dstr);
                      const entry = entries[`${m.id}:${dstr}`];
                      if (isHol || !entry) {
                        segs.push({ startIdx: idx, dates: [d], entry: null });
                        idx++;
                      } else {
                        let end = idx + 1;
                        while (end < allDates.length && end !== fd1.length) {
                          const d2 = allDates[end];
                          const dstr2 = ds(d2);
                          if (AT_HOLIDAYS.has(dstr2)) break;
                          const e2 = entries[`${m.id}:${dstr2}`];
                          if (!e2 || e2.type !== entry.type || (e2.label || '') !== (entry.label || '')) break;
                          end++;
                        }
                        segs.push({ startIdx: idx, dates: allDates.slice(idx, end), entry });
                        idx = end;
                      }
                    }
                    return (
                      <tr key={m.id} className={`plan-row${rowIdx % 2 === 1 ? ' plan-row-alt' : ''}`}>
                        <td className="plan-name-td">{m.name}</td>
                        {segs.map((seg, si) => {
                          const d = seg.dates[0];
                          const i = seg.startIdx;
                          const dateStr = ds(d);
                          const entry = seg.entry;
                          const ti = entry ? TYPE_MAP[entry.type] : null;
                          const isHol = AT_HOLIDAYS.has(dateStr);
                          const todayInSeg = seg.dates.some(dd => isToday(dd));
                          const cellText = entry?.label || (ti?.code || null);
                          return (
                            <td
                              key={si}
                              colSpan={seg.dates.length > 1 ? seg.dates.length : undefined}
                              className={cls(d, i, `plan-cell${todayInSeg ? ' plan-today' : ''}`)}
                              style={(!isHol && !isWE(d) && ti) ? { background: ti.bg, color: ti.fg } : undefined}
                              title={isHol ? 'Feiertag' : ti ? `${ti.label}${entry.label ? ': ' + entry.label : ''}` : ''}
                              onClick={isHol ? undefined : e => openCell(m.id, dateStr, e.currentTarget.getBoundingClientRect())}
                            >
                              {cellText ? <span className="plan-cell-text">{cellText}</span> : null}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {popover && (
        <div ref={popRef} className="plan-popover" style={{ left: popover.x, top: popover.y }}>
          <div className="plan-pop-header">
            <span className="plan-pop-date">{popover.dateStr}</span>
            <button className="modal-close" onClick={() => setPopover(null)}>×</button>
          </div>
          <div className="plan-type-grid">
            {PLAN_TYPES.map(t => (
              <button
                key={t.key}
                className="plan-type-btn"
                style={{
                  background: t.bg,
                  color: t.fg,
                  outline: popover.type === t.key ? '2px solid #000' : 'none',
                  outlineOffset: '-2px',
                }}
                onClick={() => setPopover(p => ({ ...p, type: t.key }))}
              >
                {t.label}
              </button>
            ))}
          </div>
          <input
            className="modal-input"
            placeholder="Projekttext (optional)"
            value={popover.label}
            autoFocus
            onChange={e => setPopover(p => ({ ...p, label: e.target.value }))}
            onKeyDown={e => { if (e.key === 'Enter') saveCell(); if (e.key === 'Escape') setPopover(null); }}
          />
          <div className="plan-pop-actions">
            <button className="btn-primary" onClick={saveCell}>Speichern</button>
            <button className="btn-secondary" onClick={clearCell}>Löschen</button>
          </div>
        </div>
      )}
    </div>
  );
}
