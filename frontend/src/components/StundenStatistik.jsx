// Version: 0.1.0
import React from 'react';

const WEEKS = ['KW30', 'KW31', 'KW32', 'KW33'];

const CATEGORIES = [
  { key: 'oa_ps_general',    label: 'OA PS-GENERAL',      color: '#1565c0' },
  { key: 'presales',         label: 'PRESALES',            color: '#1976d2' },
  { key: 'partnermgmt',      label: 'PARTNERMGMT.',        color: '#1e88e5' },
  { key: 'coc_assistance',   label: 'COC ASSISTANCE',      color: '#2196f3' },
  { key: 'oa_ps',            label: 'OA PS',               color: '#42a5f5' },
  { key: 'extended',         label: 'EXTENDED SERVICES',   color: '#90caf9' },
  { key: 'urlaub',           label: 'URLAUB/ZA',           color: '#0d47a1' },
];

const DATA = {
  KW30: { oa_ps_general: 18, presales: 12, partnermgmt: 8,  coc_assistance: 6,  oa_ps: 10, extended: 4,  urlaub: 14 },
  KW31: { oa_ps_general: 22, presales: 8,  partnermgmt: 10, coc_assistance: 4,  oa_ps: 12, extended: 6,  urlaub: 10 },
  KW32: { oa_ps_general: 16, presales: 14, partnermgmt: 6,  coc_assistance: 8,  oa_ps: 8,  extended: 8,  urlaub: 12 },
  KW33: { oa_ps_general: 20, presales: 10, partnermgmt: 12, coc_assistance: 5,  oa_ps: 14, extended: 3,  urlaub: 8  },
};

function rowTotal(kw) {
  return CATEGORIES.reduce((s, c) => s + (DATA[kw][c.key] || 0), 0);
}

export default function StundenStatistik() {
  return (
    <div className="stunden-wrap">
      <h2 className="stunden-title">Gebuchte Stunden und Urlaub nach Woche</h2>

      <div className="stunden-chart">
        {WEEKS.map(kw => {
          const total = rowTotal(kw);
          return (
            <div key={kw} className="stunden-row">
              <div className="stunden-kw-label">{kw}</div>
              <div className="stunden-bar-wrap">
                {CATEGORIES.map(cat => {
                  const val = DATA[kw][cat.key] || 0;
                  const pct = total > 0 ? (val / total) * 100 : 0;
                  return pct > 0 ? (
                    <div
                      key={cat.key}
                      className="stunden-bar-seg"
                      style={{ width: `${pct}%`, background: cat.color }}
                      title={`${cat.label}: ${val}h`}
                    >
                      {pct > 5 ? <span className="stunden-seg-label">{val}h</span> : null}
                    </div>
                  ) : null;
                })}
              </div>
              <div className="stunden-total-label">{total}h</div>
            </div>
          );
        })}
      </div>

      <div className="stunden-legend">
        {CATEGORIES.map(cat => (
          <div key={cat.key} className="stunden-legend-item">
            <span className="stunden-legend-dot" style={{ background: cat.color }} />
            <span>{cat.label}</span>
          </div>
        ))}
      </div>

      <p className="stunden-note">Statische Beispieldaten — wird später mit echten Buchungsdaten verbunden.</p>
    </div>
  );
}
