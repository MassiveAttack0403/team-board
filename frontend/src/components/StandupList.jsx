// Version: 0.1.0
import React, { useEffect, useState } from 'react';
import { getStandups, createStandup } from '../api/client';
import { getISOWeek, format } from 'date-fns';

export default function StandupList() {
  const [summaries, setSummaries] = useState([]);
  const [form, setForm] = useState({ week: '', meeting_date: '', summary: '', source_url: '' });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    getStandups().then(setSummaries);
  }, []);

  const handleSave = async () => {
    if (!form.week || !form.meeting_date || !form.summary) return;
    await createStandup(form);
    setAdding(false);
    setForm({ week: '', meeting_date: '', summary: '', source_url: '' });
    getStandups().then(setSummaries);
  };

  return (
    <div className="standup-panel">
      <h2>Standup-Zusammenfassungen</h2>
      <button style={{ marginBottom: 12, padding: '5px 12px', background: '#009999', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer' }} onClick={() => setAdding(v => !v)}>
        {adding ? 'Abbrechen' : '+ Zusammenfassung hinzufügen'}
      </button>
      {adding && (
        <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input placeholder="Woche z.B. 2026-W34" value={form.week} onChange={e => setForm(f => ({ ...f, week: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }} />
          <input type="date" value={form.meeting_date} onChange={e => setForm(f => ({ ...f, meeting_date: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }} />
          <textarea rows={6} placeholder="Copilot-Zusammenfassung hier einfügen…" value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1', fontFamily: 'inherit', fontSize: '0.82rem' }} />
          <input placeholder="Teams-Meeting-Link (optional)" value={form.source_url} onChange={e => setForm(f => ({ ...f, source_url: e.target.value }))} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid #cbd5e1' }} />
          <button onClick={handleSave} style={{ padding: '5px 12px', background: '#009999', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', alignSelf: 'flex-start' }}>Speichern</button>
        </div>
      )}
      {summaries.map(s => (
        <div key={s.id} className="standup-entry">
          <h3>{s.week} — {s.meeting_date} {s.source_url && <a href={s.source_url} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#009999' }}>→ Teams-Link</a>}</h3>
          <pre>{s.summary}</pre>
        </div>
      ))}
    </div>
  );
}
