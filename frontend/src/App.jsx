// Version: 0.3.0
import React from 'react';
import Board from './components/Board';
import StandupList from './components/StandupList';
import AbsenceCalendar from './components/AbsenceCalendar';

function Nav() {
  const path = window.location.pathname;
  return (
    <nav>
      <a href="/" className={path === '/' ? 'nav-active' : ''}>Team</a>
      <a href="/absences" className={path === '/absences' ? 'nav-active' : ''}>Kalender</a>
      <a href="/standups" className={path === '/standups' ? 'nav-active' : ''}>Standups</a>
    </nav>
  );
}

export default function App() {
  const path = window.location.pathname;
  return (
    <>
      <header>
        <h1>Team Board</h1>
        <Nav />
      </header>
      {path === '/standups' ? <StandupList /> :
       path === '/absences' ? <AbsenceCalendar /> :
       <Board />}
    </>
  );
}
