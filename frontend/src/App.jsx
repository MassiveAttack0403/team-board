// Version: 0.6.0 — Client-side SPA routing (instant navigation without full page reload)
import React, { useState, useEffect } from 'react';
import Board from './components/Board';
import StandupList from './components/StandupList';
import PlanCalendar from './components/PlanCalendar';
import Partnering from './components/Partnering';
import StundenStatistik from './components/StundenStatistik';
import SrStatistik from './components/SrStatistik';

function Nav({ currentPath, onNavigate }) {
  const links = [
    { href: '/', label: 'Team' },
    { href: '/plan', label: 'Plan' },
    { href: '/partnering', label: 'Partnering' },
    { href: '/stunden', label: 'Stunden' },
    { href: '/sr', label: 'SR Statistik' },
    { href: '/standups', label: 'Standups' },
  ];

  return (
    <nav>
      {links.map(l => (
        <a
          key={l.href}
          href={l.href}
          className={currentPath === l.href ? 'nav-active' : ''}
          onClick={(e) => {
            e.preventDefault();
            onNavigate(l.href);
          }}
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}

export default function App() {
  const [path, setPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname || '/');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (newPath) => {
    if (newPath !== path) {
      window.history.pushState({}, '', newPath);
      setPath(newPath);
    }
  };

  return (
    <>
      <header>
        <h1 style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>Team Board</h1>
        <Nav currentPath={path} onNavigate={navigate} />
      </header>
      {path === '/standups'  ? <StandupList /> :
       path === '/plan'      ? <PlanCalendar /> :
       path === '/partnering'? <Partnering /> :
       path === '/stunden'   ? <StundenStatistik /> :
       path === '/sr'        ? <SrStatistik /> :
       <Board />}
    </>
  );
}
