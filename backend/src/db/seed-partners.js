// Version: 0.1.1 — Initial seed for partner companies (standalone without circular import)
'use strict';

const PARTNERS = [
  { name: 'Brückner',                      status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Mousser Kerkeni',        last_meeting: '09.02.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Rittmeyer',                     status: 'done',    interval: 'monthly',    lang: 'de',  premium: 'IC',               contact: 'Jochen Steindorfer',     last_meeting: '09.03.2026', link: 'ETM - Kundendaten - Dokumente - Gesprächsprotokolle - Alle Dokumente' },
  { name: 'Sartorius',                     status: 'done',    interval: 'bi weekly',  lang: 'de',  premium: '',                 contact: 'Emanuel Ivanovic',       last_meeting: '13.04.2026', link: 'StatusRunde_Sartorius_154+.xlsx' },
  { name: 'Veo',                           status: 'done',    interval: 'bi weekly',  lang: 'en',  premium: '',                 contact: 'Emanuel Ivanovic',       last_meeting: '16.06.2026', link: 'VEO' },
  { name: 'ESCAD',                         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Parameshwaran Raju',     last_meeting: '16.02.2026', link: 'ESCAD' },
  { name: 'Firstco',                       status: 'done',    interval: 'monthly',    lang: 'en',  premium: '',                 contact: 'Markus Gerstl',          last_meeting: '',           link: '' },
  { name: 'MDN-TEC S.A.',                  status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Ahmed Fadl',             last_meeting: '13.05.2026', link: 'https://siemens.sharepoint.com/:o:/r/teams/Kundendaten773/' },
  { name: 'CNPEM',                         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Jochen Steindorfer',     last_meeting: '15.01.2026', link: 'ETM - Kundendaten - Dokumente - Cnpem - Alle Dokumente' },
  { name: 'Croon',                         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Sofiane (from Geri)',    last_meeting: '09.03.2026', link: 'ON_Croon' },
  { name: 'Granitor',                      status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Emanuel Ivanovic',       last_meeting: '19.02.2026', link: 'https://siemens.sharepoint.com/teams/Kundendaten773/' },
  { name: 'Tratec Norcon AS - NO',         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: 'IC',               contact: 'Emanuel Ivanovic',       last_meeting: '07.04.2026', link: 'Strategic Partnering Campaign Tratec' },
  { name: 'SAGE Australia',                status: 'done',    interval: 'bi monthly', lang: 'en',  premium: '',                 contact: 'Emanuel Ivanovic',       last_meeting: '',           link: '' },
  { name: 'Siemens DI (Cranes)',           status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Mousser Kerkeni',        last_meeting: '25.03.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Siemens Mobility, Inc',         status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Parameshwaran Raju',     last_meeting: '11.03.2026', link: 'PTC BOS' },
  { name: 'Actemium Cegelec West GmbH',   status: 'done',    interval: 'quarterly',  lang: 'de',  premium: 'IC',               contact: 'Jochen Steindorfer',     last_meeting: '28.10.2025', link: 'ETM - Kundendaten - Actemium Cegelec West GmbH - Alle Dokumente' },
  { name: 'ID&A',                          status: 'done',    interval: 'quarterly',  lang: 'en',  premium: 'IC',               contact: 'Mousser Kerkeni',        last_meeting: '25.02.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'INGETEAM POWER TECHNOLOGY, S.A.', status: 'done', interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Mousser Kerkeni',        last_meeting: '16.04.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Sigren Engineering AG',         status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Franz Kopecky',          last_meeting: '22.01.2026', link: 'ETM Kundendaten - ON Sigren' },
  { name: 'SPIE BTAT (Osmo)',              status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Jochen Steindorfer',     last_meeting: '27.03.2026', link: 'ON_Spie_OSMO' },
  { name: 'Siemens Mobility Madrid',       status: 'done',    interval: 'quarterly',  lang: 'en',  premium: 'Beta Interessent', contact: 'Jochen Steindorfer',     last_meeting: '22.01.2026', link: 'ETM - Kundendaten - Dokumente - Siemens Mobility Madrid - Alle Dokumente' },
  { name: 'Siemens RC-DE DI CS / PA SO',  status: 'done',    interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Franz Kopecky',          last_meeting: '24.03.2026', link: '-' },
  { name: 'Ardan (Mekorot)',               status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Jochen Steindorfer',     last_meeting: '15.02.2026', link: 'ETM - Kundendaten - Dokumente - MoMs - Alle Dokumente' },
  { name: 'Yunex Traffic Netherlands',     status: 'done',    interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Mousser Kerkeni',        last_meeting: '23.04.2026', link: 'https://siemens.sharepoint.com/:f:/r/teams/Kundendaten773/' },
  { name: 'Solid State Automation',        status: 'ongoing', interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Markus T (from Geri)',   last_meeting: '',           link: '' },
  { name: 'Cern',                          status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: 'IC',               contact: 'Emanuel Ivanovic',       last_meeting: '',           link: '' },
  { name: 'AllTec',                        status: 'ongoing', interval: 'quarterly',  lang: 'de?', premium: '',                 contact: 'Markus T (from Geri)',   last_meeting: '',           link: '' },
  { name: 'Bilfinger/Mauell',              status: 'ongoing', interval: 'quarterly',  lang: 'de?', premium: '',                 contact: 'Franz Kopecky',          last_meeting: '',           link: '' },
  { name: 'Cleverdist',                    status: 'ongoing', interval: 'quarterly',  lang: 'en',  premium: '',                 contact: 'Franz Kopecky',          last_meeting: '',           link: '' },
  { name: 'F&S',                           status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Franz Kopecky',          last_meeting: '',           link: '' },
  { name: 'ADB Safegate',                  status: 'ongoing', interval: 'quarterly',  lang: '?',   premium: '',                 contact: 'Ahmed Fadl',             last_meeting: '',           link: '' },
  { name: 'Siemens SI BT',                 status: 'ongoing', interval: 'quarterly',  lang: '?',   premium: '',                 contact: 'Parameshwaran Raju',     last_meeting: '',           link: '' },
  { name: 'Siemens Mobility',              status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Emanuel (from Geri)',    last_meeting: '',           link: '' },
  { name: 'Siemens SI',                    status: 'ongoing', interval: 'quarterly',  lang: '?',   premium: '',                 contact: 'Mousser Kerkeni',        last_meeting: 'NOCH NICHT stattgefunden', link: '' },
  { name: 'Siemens SI GSW',               status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Mousser Kerkeni',        last_meeting: 'NOCH NICHT stattgefunden', link: '' },
  { name: 'YUNEX',                         status: 'ongoing', interval: 'quarterly',  lang: 'de',  premium: '',                 contact: 'Parameshwaran Raju',     last_meeting: '',           link: '' },
];

function seedPartners(db) {
  const count = db.prepare('SELECT COUNT(*) as c FROM partner_companies').get().c;
  if (count > 0) {
    return;
  }
  const insert = db.prepare(`
    INSERT INTO partner_companies (name, status, interval, lang, premium, contact, last_meeting, link)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const p of PARTNERS) {
    insert.run(p.name, p.status, p.interval, p.lang, p.premium, p.contact, p.last_meeting, p.link);
  }
  console.log(`[seed-partners] Seeded ${PARTNERS.length} partner companies.`);
}

module.exports = { seedPartners, PARTNERS };
