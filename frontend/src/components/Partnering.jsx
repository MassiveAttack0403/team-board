// Version: 0.1.0
import React, { useState } from 'react';

const PARTNERS = [
  { name: 'Brückner',                      status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Mousser Kerkeni',        lastMeeting: '09.02.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Rittmeyer',                     status: 'done',    interval: 'monthly',    lang: 'de',  premium: 'IC',               contact: 'Jochen Steindorfer',     lastMeeting: '09.03.2026', link: 'ETM - Kundendaten - Dokumente - Gesprächsprotokolle - Alle Dokumente' },
  { name: 'Sartorius',                     status: 'done',    interval: 'bi weekly',  lang: 'de',  premium: '',                 contact: 'Emanuel Ivanovic',       lastMeeting: '13.04.2026', link: 'StatusRunde_Sartorius_154+.xlsx' },
  { name: 'Veo',                           status: 'done',    interval: 'bi weekly',  lang: 'en',  premium: '',                 contact: 'Emanuel Ivanovic',       lastMeeting: '16.06.2026', link: 'VEO' },
  { name: 'ESCAD',                         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Parameshwaran Raju',     lastMeeting: '16.02.2026', link: 'ESCAD' },
  { name: 'Firstco',                       status: 'done',    interval: 'monthly',    lang: 'en',  premium: '',                 contact: 'Markus Gerstl',          lastMeeting: '',           link: '' },
  { name: 'MDN-TEC S.A.',                  status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Ahmed Fadl',             lastMeeting: '13.05.2026', link: 'https://siemens.sharepoint.com/:o:/r/teams/Kundendaten773/' },
  { name: 'CNPEM',                         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Jochen Steindorfer',     lastMeeting: '15.01.2026', link: 'ETM - Kundendaten - Dokumente - Cnpem - Alle Dokumente' },
  { name: 'Croon',                         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Sofiane (from Geri)',    lastMeeting: '09.03.2026', link: 'ON_Croon' },
  { name: 'Granitor',                      status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Emanuel Ivanovic',       lastMeeting: '19.02.2026', link: 'https://siemens.sharepoint.com/teams/Kundendaten773/' },
  { name: 'Tratec Norcon AS - NO',         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: 'IC',               contact: 'Emanuel Ivanovic',       lastMeeting: '07.04.2026', link: 'Strategic Partnering Campaign Tratec' },
  { name: 'SAGE Australia',                status: 'done',    interval: 'bi monthly', lang: 'en',  premium: '',                 contact: 'Emanuel Ivanovic',       lastMeeting: '',           link: '' },
  { name: 'Siemens DI (Cranes)',           status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Mousser Kerkeni',        lastMeeting: '25.03.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Siemens Mobility, Inc',         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Parameshwaran Raju',     lastMeeting: '11.03.2026', link: 'PTC BOS' },
  { name: 'Actemium Cegelec West GmbH',   status: 'done',    interval: 'quarterly',  lang: 'de',  premium: 'IC',               contact: 'Jochen Steindorfer',     lastMeeting: '28.10.2025', link: 'ETM - Kundendaten - Actemium Cegelec West GmbH - Alle Dokumente' },
  { name: 'ID&A',                          status: 'done',    interval: 'quarterly',  lang: 'en',  premium: 'IC',               contact: 'Mousser Kerkeni',        lastMeeting: '25.02.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'INGETEAM POWER TECHNOLOGY, S.A.', status: 'done', interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Mousser Kerkeni',        lastMeeting: '16.04.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Sigren Engineering AG',         status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Franz Kopecky',          lastMeeting: '22.01.2026', link: 'ETM Kundendaten - ON Sigren' },
  { name: 'SPIE BTAT (Osmo)',              status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Jochen Steindorfer',     lastMeeting: '27.03.2026', link: 'ON_Spie_OSMO' },
  { name: 'Siemens Mobility Madrid',       status: 'done',    interval: 'quarterly',  lang: 'en',  premium: 'Beta Interessent', contact: 'Jochen Steindorfer',     lastMeeting: '22.01.2026', link: 'ETM - Kundendaten - Dokumente - Siemens Mobility Madrid - Alle Dokumente' },
  { name: 'Siemens RC-DE DI CS / PA SO',  status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Franz Kopecky',          lastMeeting: '24.03.2026', link: '-' },
  { name: 'Ardan (Mekorot)',               status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Jochen Steindorfer',     lastMeeting: '15.02.2026', link: 'ETM - Kundendaten - Dokumente - MoMs - Alle Dokumente' },
  { name: 'Yunex Traffic Netherlands',     status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Mousser Kerkeni',        lastMeeting: '23.04.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Solid State Automation',        status: 'ongoing', interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Markus T (from Geri)',   lastMeeting: '',           link: '' },
  { name: 'Cern',                          status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: 'IC',               contact: 'Emanuel Ivanovic',       lastMeeting: '',           link: '' },
  { name: 'AllTec',                        status: 'ongoing', interval: 'quarterly',  lang: 'de?', premium: '',                 contact: 'Markus T (from Geri)',   lastMeeting: '',           link: '' },
  { name: 'Bilfinger/Mauell',              status: 'ongoing', interval: 'quarterly',  lang: 'de?', premium: '',                 contact: 'Franz Kopecky',          lastMeeting: '',           link: '' },
  { name: 'Cleverdist',                    status: 'ongoing', interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Franz Kopecky',          lastMeeting: '',           link: '' },
  { name: 'F&S',                           status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Franz Kopecky',          lastMeeting: '',           link: '' },
  { name: 'ADB Safegate',                  status: 'ongoing', interval: 'quarterly',  lang: '?',   premium: '',                 contact: 'Ahmed Fadl',             lastMeeting: '',           link: '' },
  { name: 'Siemens SI BT',                 status: 'ongoing', interval: 'quarterly',  lang: '?',   premium: '',                 contact: 'Parameshwaran Raju',     lastMeeting: '',           link: '' },
  { name: 'Siemens Mobility',              status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Emanuel (from Geri)',    lastMeeting: '',           link: '' },
  { name: 'Siemens SI',                    status: 'ongoing', interval: 'quarterly',  lang: '?',   premium: '',                 contact: 'Mousser Kerkeni',        lastMeeting: 'NOCH NICHT stattgefunden', link: '' },
  { name: 'Siemens SI GSW',               status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Mousser Kerkeni',        lastMeeting: 'NOCH NICHT stattgefunden', link: '' },
  { name: 'YUNEX',                         status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Parameshwaran Raju',     lastMeeting: '',           link: '' },
];

function truncate(str, n = 40) {
  return str && str.length > n ? str.slice(0, n) + '…' : str;
}

export default function Partnering() {
  const [filter, setFilter] = useState('all');

  const visible = filter === 'all' ? PARTNERS : PARTNERS.filter(p => p.status === filter);

  return (
    <div className="partnering-wrap">
      <div className="partnering-header">
        <div className="partnering-title-block">
          <div className="partnering-logo-circle">
            <span>Partnering<br />for<br />Success</span>
          </div>
        </div>
        <div className="partnering-controls">
          <button className={`part-filter-btn${filter === 'all' ? ' active' : ''}`} onClick={() => setFilter('all')}>Alle ({PARTNERS.length})</button>
          <button className={`part-filter-btn done${filter === 'done' ? ' active' : ''}`} onClick={() => setFilter('done')}>Done ({PARTNERS.filter(p => p.status === 'done').length})</button>
          <button className={`part-filter-btn ongoing${filter === 'ongoing' ? ' active' : ''}`} onClick={() => setFilter('ongoing')}>Ongoing ({PARTNERS.filter(p => p.status === 'ongoing').length})</button>
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
            </tr>
          </thead>
          <tbody>
            {visible.map((p, i) => (
              <tr key={i} className={`part-row part-row-${p.status}`}>
                <td className="part-name">{p.name}</td>
                <td className={`part-status part-status-${p.status}`}>{p.status}</td>
                <td>{p.interval}</td>
                <td>{p.lang}</td>
                <td>{p.premium}</td>
                <td>{p.contact}</td>
                <td className="part-date">{p.lastMeeting}</td>
                <td className="part-link" title={p.link}>
                  {p.link && p.link.startsWith('http') ? (
                    <a href={p.link} target="_blank" rel="noreferrer">{truncate(p.link, 45)}</a>
                  ) : (
                    <span>{truncate(p.link, 45)}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
