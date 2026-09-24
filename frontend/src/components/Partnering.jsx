// Version: 0.2.0 — Partnering for Success mit DB-Anbindung, Bearbeitung & Erstellung
import React, { useState, useEffect } from 'react';
import { getPartners, createPartner, updatePartner, deletePartner } from '../api/client';

function truncate(str, n = 40) {
  return str && str.length > n ? str.slice(0, n) + '…' : str;
}

export default function Partnering() {
  const [partners, setPartners] = useState([]);
  const [filter, setFilter] = useState('all');
  const [editingPartner, setEditingPartner] = useState(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => {
    getPartners().then(setPartners).catch(err => console.error(err));
  };

  useEffect(() => {
    load();
  }, []);

  const visible = filter === 'all' ? partners : partners.filter(p => p.status === filter);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingPartner.name.trim()) return;

    if (isNew) {
      await createPartner(editingPartner);
    } else {
      await updatePartner(editingPartner.id, editingPartner);
    }
    setEditingPartner(null);
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Partnerfirma wirklich löschen?')) {
      await deletePartner(id);
      setEditingPartner(null);
      load();
    }
  };

  return (
    <div className="partnering-wrap">
      <div className="partnering-header">
        <div className="partnering-title-block">
          <div className="partnering-logo-circle">
            <span>Partnering<br />for<br />Success</span>
          </div>
        </div>
        <div className="partnering-controls">
          <button className={`part-filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>
            Alle ({partners.length})
          </button>
          <button className={`part-filter-btn done${filter === 'done' ? ' active' : ''}`} onClick={() => setFilter('done')}>
            Done ({partners.filter(p => p.status === 'done').length})
          </button>
          <button className={`part-filter-btn ongoing${filter === 'ongoing' ? ' active' : ''}`} onClick={() => setFilter('ongoing')}>
            Ongoing ({partners.filter(p => p.status === 'ongoing').length})
          </button>
          <button
            className="btn-primary"
            style={{ marginLeft: 16, padding: '6px 14px', fontSize: '0.8rem' }}
            onClick={() => {
              setIsNew(true);
              setEditingPartner({
                name: '',
                status: 'ongoing',
                interval: 'quarterly',
                lang: 'de',
                premium: '',
                contact: '',
                last_meeting: '',
                link: ''
              });
            }}
          >
            + Partner hinzufügen
          </button>
        </div>
      </div>

      <div className="partnering-table-wrap">
        <table className="partnering-table">
          <thead>
            <tr>
              <th>Partner company</th>
              <th>established</th>
              <th>interval</th>
              <th>language</th>
              <th>Premium</th>
              <th>ETM contact</th>
              <th>Last meeting</th>
              <th>Link protocol</th>
              <th style={{ width: 60 }}>Aktion</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((p) => (
              <tr key={p.id || p.name} className={`part-row part-row-${p.status}`}>
                <td className="part-name" style={{ fontWeight: 600 }}>{p.name}</td>
                <td className={`part-status part-status-${p.status}`}>{p.status}</td>
                <td>{p.interval}</td>
                <td>{p.lang}</td>
                <td>{p.premium}</td>
                <td>{p.contact}</td>
                <td className="part-date">{p.last_meeting || p.lastMeeting || '-'}</td>
                <td className="part-link" title={p.link}>
                  {p.link && p.link.startsWith('http') ? (
                    <a href={p.link} target="_blank" rel="noreferrer">{truncate(p.link, 45)}</a>
                  ) : (
                    <span>{truncate(p.link, 45) || '-'}</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                    onClick={() => {
                      setIsNew(false);
                      setEditingPartner({
                        ...p,
                        last_meeting: p.last_meeting || p.lastMeeting || ''
                      });
                    }}
                  >
                    Bearbeiten
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingPartner && (
        <div className="modal-overlay" onClick={() => setEditingPartner(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
            <div className="modal-header">
              <h3>{isNew ? 'Neuen Partner anlegen' : `Partner bearbeiten: ${editingPartner.name}`}</h3>
              <button className="modal-close" onClick={() => setEditingPartner(null)}>×</button>
            </div>
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                className="modal-input"
                placeholder="Name der Partnerfirma"
                value={editingPartner.name}
                onChange={e => setEditingPartner({ ...editingPartner, name: e.target.value })}
                required
                autoFocus
              />
              <div className="modal-row">
                <select
                  className="modal-select"
                  value={editingPartner.status}
                  onChange={e => setEditingPartner({ ...editingPartner, status: e.target.value })}
                >
                  <option value="done">done (established)</option>
                  <option value="ongoing">ongoing</option>
                </select>
                <input
                  className="modal-input"
                  placeholder="Intervall (z.B. quarterly, monthly)"
                  value={editingPartner.interval}
                  onChange={e => setEditingPartner({ ...editingPartner, interval: e.target.value })}
                />
              </div>
              <div className="modal-row">
                <input
                  className="modal-input"
                  placeholder="Sprache (de, en)"
                  value={editingPartner.lang}
                  onChange={e => setEditingPartner({ ...editingPartner, lang: e.target.value })}
                />
                <input
                  className="modal-input"
                  placeholder="Premium (z.B. IC, Beta)"
                  value={editingPartner.premium || ''}
                  onChange={e => setEditingPartner({ ...editingPartner, premium: e.target.value })}
                />
              </div>
              <div className="modal-row">
                <input
                  className="modal-input"
                  placeholder="ETM Contact (z.B. Jochen Steindorfer)"
                  value={editingPartner.contact}
                  onChange={e => setEditingPartner({ ...editingPartner, contact: e.target.value })}
                />
                <input
                  className="modal-input"
                  placeholder="Letztes Meeting (z.B. 09.03.2026)"
                  value={editingPartner.last_meeting || ''}
                  onChange={e => setEditingPartner({ ...editingPartner, last_meeting: e.target.value })}
                />
              </div>
              <input
                className="modal-input"
                placeholder="Link zu Protokoll / SharePoint / Excel"
                value={editingPartner.link || ''}
                onChange={e => setEditingPartner({ ...editingPartner, link: e.target.value })}
              />
              <div className="modal-actions" style={{ marginTop: 8 }}>
                <button type="submit" className="btn-primary">Speichern</button>
                {!isNew && (
                  <button type="button" className="btn-danger" onClick={() => handleDelete(editingPartner.id)}>
                    Löschen
                  </button>
                )}
                <button type="button" className="btn-secondary" onClick={() => setEditingPartner(null)}>
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
