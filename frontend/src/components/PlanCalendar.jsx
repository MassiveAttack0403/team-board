// Version: 0.2.0
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { getMembers, getPlan, setPlanEntry, deletePlanEntry } from '../api/client';
import { startOfMonth, endOfMonth, addMonths, addDays, format, getISOWeek, isToday } from 'date-fns';

const PLAN_TYPES = [
  { key: 'consulting_blocked', label: 'Consulting geblockt',     bg: '#1e3a8a', fg: '#fff' },
  { key: 'consulting_ordered', label: 'Consulting bestellt',     bg: '#fef08a', fg: '#333' },
  { key: 'planned_ice',        label: 'Verplant Eis',            bg: '#9333ea', fg: '#fff' },
  { key: 'travel',             label: 'Reise',                   bg: '#86efac', fg: '#14532d' },
  { key: 'training_blocked',   label: 'Schulung geblockt',       bg: '#f97316', fg: '#fff' },
  { key: 'training_ordered',   label: 'Schulung bestellt (fix)', bg: '#16a34a', fg: '#fff' },
  { key: 'vacation',           label: 'Urlaub / ZA',             bg: '#3b82f6', fg: '#fff' },
  { key: 'home_office',        label: 'Home Office',             bg: '#fca5a5', fg: '#7f1d1d' },
  { key: 'other_event',        label: 'Sonstiges Event',         bg: '#67e8f9', fg: '#0c4a6e' },
  { key: 'no_travel',          label: 'keine Reise möglich',     bg: '#f472b6', fg: '#fff' },
  { key: 'continue',           label: 'Weiter',                  bg: '#0f766e', fg: '#fff' },
  { key: 'partner',            label: 'Partner',                 bg: '#c4b5fd', fg: '#4c1d95' },
];

const TYPE_MAP = Object.fromEntries(PLAN_TYPES.map(t => [t.key, t]));
const WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTH_NAMES = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const NUM_MONTHS = 6;

function ds(d) { return format(d, 'yyyy-MM-dd'); }
function isWE(d) { const w = d.getDay(); return w === 0 || w === 6; }

function genDates(base) {
  const start = startOfMonth(base);
  const end = endOfMonth(addMonths(start, NUM_MONTHS - 1));
  const out = [];
  let d = new Date(start);
  while (d <= end) { out.push(new Date(d)); d = addDays(d, 1); }
  return out;
}

function monthGroups(dates) {
  const groups = [];
  let cur = null;
  for (const d of dates) {
    const key = d.getFullYear() * 12 + d.getMonth();
    if (!cur || cur.key !== key) {
      cur = { key, label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, days: [] };
      groups.push(cur);
    }
    cur.days.push(d);
  }
  return groups;
}

function weekGroups(dates) {
  const groups = [];
  let cur = null;
  for (const d of dates) {
    const yr = d.getFullYear();
    const wk = getISOWeek(d);
    const key = `${yr}-${wk}`;
    if (!cur || cur.key !== key) {
      cur = { key, number: wk, days: [] };
      groups.push(cur);
    }
    cur.days.push(d);
  }
  return groups;
}

export default function PlanCalendar() {
  const [members, setMembers] = useState([]);
  const [entries, setEntries] = useState({});
  const [base, setBase] = useState(() => startOfMonth(new Date()));
  const [popover, setPopover] = useState(null);
  const popRef = useRef(null);

  const dates   = useMemo(() => genDates(base), [base]);
  const mGroups = useMemo(() => monthGroups(dates), [dates]);
  const wGroups = useMemo(() => weekGroups(dates), [dates]);
  const fromStr = useMemo(() => ds(dates[0]), [dates]);
  const toStr   = useMemo(() => ds(dates[dates.length - 1]), [dates]);

  useEffect(() => { getMembers().then(setMembers); }, []);

  useEffect(() => {
    getPlan(fromStr, toStr).then(rows => {
      const map = {};
      for (const r of rows) map[`${r.member_id}:${r.date}`] = { type: r.type, label: r.label || '' };
      setEntries(map);
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

  const endBase = addMonths(base, NUM_MONTHS - 1);
  const rangeLabel = `${MONTH_NAMES[base.getMonth()]} ${base.getFullYear()} – ${MONTH_NAMES[endBase.getMonth()]} ${endBase.getFullYear()}`;

  return (
    <div className="plan-wrap">
      <div className="plan-legend">
        {PLAN_TYPES.map(t => (
          <span key={t.key} className="plan-legend-chip" style={{ background: t.bg, color: t.fg }}>{t.label}</span>
        ))}
      </div>

      <div className="board-toolbar">
        <button className="btn-header" onClick={() => setBase(m => addMonths(m, -1))}>‹ zurück</button>
        <span className="week-label">{rangeLabel}</span>
        <button className="btn-header" onClick={() => setBase(m => addMonths(m, 1))}>weiter ›</button>
        <button className="btn-header" style={{ marginLeft: 'auto' }} onClick={() => setBase(startOfMonth(new Date()))}>Heute</button>
      </div>

      <div className="plan-scroll">
        <table className="plan-table">
          <thead>
            <tr>
              <th className="plan-name-th plan-th-month">Name</th>
              {mGroups.map(g => (
                <th key={g.key} colSpan={g.days.length} className="plan-th-month">{g.label}</th>
              ))}
            </tr>
            <tr>
              <th className="plan-name-th plan-th-kw" />
              {wGroups.map(g => (
                <th key={g.key} colSpan={g.days.length} className="plan-th-kw">KW {g.number}</th>
              ))}
            </tr>
            <tr>
              <th className="plan-name-th plan-th-wd" />
              {dates.map((d, i) => (
                <th key={i} className={`plan-th-wd${isWE(d) ? ' plan-we' : ''}`}>{WD[d.getDay()]}</th>
              ))}
            </tr>
            <tr>
              <th className="plan-name-th plan-th-day" />
              {dates.map((d, i) => (
                <th key={i} className={`plan-th-day${isWE(d) ? ' plan-we' : ''}${isToday(d) ? ' plan-today-header' : ''}`}>{d.getDate()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.id} className="plan-row">
                <td className="plan-name-td">{m.name}</td>
                {dates.map((d, i) => {
                  const dateStr = ds(d);
                  const entry = entries[`${m.id}:${dateStr}`];
                  const ti = entry ? TYPE_MAP[entry.type] : null;
                  return (
                    <td
                      key={i}
                      className={`plan-cell${isWE(d) ? ' plan-we' : ''}${isToday(d) ? ' plan-today' : ''}`}
                      style={ti ? { background: ti.bg, color: ti.fg } : undefined}
                      title={ti ? `${ti.label}${entry.label ? ': ' + entry.label : ''}` : ''}
                      onClick={e => openCell(m.id, dateStr, e.currentTarget.getBoundingClientRect())}
                    >
                      {entry?.label ? <span className="plan-cell-text">{entry.label}</span> : null}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
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
