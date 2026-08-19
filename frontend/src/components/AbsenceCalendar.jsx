// Version: 0.1.0
import React, { useEffect, useState } from 'react';
import { getMembers, getAbsences } from '../api/client';
import { addDays, startOfWeek, format, getISOWeek, isToday, isPast, parseISO } from 'date-fns';

const TYPE_COLORS = {
  URLAUB: { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe', label: 'U' },
  ZA:     { bg: '#fef9c3', text: '#92400e', border: '#fde68a', label: 'Z' },
  KS:     { bg: '#fee2e2', text: '#991b1b', border: '#fecaca', label: 'K' },
  OTHER:  { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb', label: '?' },
};

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr'];

function getWorkingDays(weeks = 5) {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  for (let i = 0; i < weeks * 7; i++) {
    const d = addDays(monday, i);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(d);
  }
  return days;
}

function absenceForDay(absences, memberId, dateStr) {
  return absences.find(a =>
    a.member_id === memberId &&
    a.date_from <= dateStr &&
    a.date_to >= dateStr
  ) || null;
}

function groupByWeek(days) {
  const weeks = [];
  let current = null;
  for (const d of days) {
    const wk = getISOWeek(d);
    if (!current || current.week !== wk) {
      current = { week: wk, days: [] };
      weeks.push(current);
    }
    current.days.push(d);
  }
  return weeks;
}

export default function AbsenceCalendar() {
  const [members, setMembers] = useState([]);
  const [absences, setAbsences] = useState([]);
  const days = getWorkingDays(5);
  const weeks = groupByWeek(days);

  useEffect(() => {
    Promise.all([getMembers(), getAbsences()]).then(([m, a]) => {
      setMembers(m);
      setAbsences(a);
    });
  }, []);

  return (
    <>
      <header>
        <h1>Team Board</h1>
        <span className="week-label">Abwesenheitskalender</span>
        <nav>
          <a href="/">Board</a>
          <a href="/standups">Standups</a>
        </nav>
      </header>

      <div className="cal-wrapper">
        <div className="cal-scroll">
          <table className="cal-table">
            <thead>
              <tr>
                <th className="cal-name-col">Name</th>
                {weeks.map(wk => (
                  <th key={wk.week} colSpan={wk.days.length} className="cal-week-header">
                    KW {wk.week}
                  </th>
                ))}
              </tr>
              <tr>
                <th className="cal-name-col" />
                {days.map(d => {
                  const str = format(d, 'yyyy-MM-dd');
                  const past = isPast(d) && !isToday(d);
                  return (
                    <th
                      key={str}
                      className={`cal-day-header${isToday(d) ? ' cal-today' : ''}${past ? ' cal-past' : ''}`}
                    >
                      <div className="cal-day-name">{DAY_NAMES[d.getDay() - 1]}</div>
                      <div className="cal-day-num">{format(d, 'dd.MM')}</div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {members.map(member => (
                <tr key={member.id} className="cal-row">
                  <td className="cal-name-cell">{member.name}</td>
                  {days.map(d => {
                    const str = format(d, 'yyyy-MM-dd');
                    const absence = absenceForDay(absences, member.id, str);
                    const todayClass = isToday(d) ? ' cal-today' : '';
                    const pastClass = (isPast(d) && !isToday(d)) ? ' cal-past' : '';
                    if (!absence) return <td key={str} className={`cal-cell${todayClass}${pastClass}`} />;
                    const c = TYPE_COLORS[absence.type] || TYPE_COLORS.OTHER;
                    return (
                      <td
                        key={str}
                        className={`cal-cell cal-absent${todayClass}${pastClass}`}
                        style={{ background: c.bg, color: c.text, borderColor: c.border }}
                        title={`${member.name}: ${absence.type} ${absence.date_from} – ${absence.date_to}`}
                      >
                        {c.label}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="cal-legend">
          {Object.entries(TYPE_COLORS).map(([type, c]) => (
            <span key={type} className="cal-legend-item" style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
              {type}
            </span>
          ))}
        </div>
      </div>
    </>
  );
}
