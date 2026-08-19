// Version: 0.4.0
import React from 'react';
import Board from './components/Board';
import StandupList from './components/StandupList';
import PlanCalendar from './components/PlanCalendar';

function Nav() {
  const path = window.location.pathname;
  return (
    <nav>
      <a href="/" className={path === '/' ? 'nav-active' : ''}>Team</a>
      <a href="/plan" className={path === '/plan' ? 'nav-active' : ''}>Plan</a>
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
       path === '/plan' ? <PlanCalendar /> :
       <Board />}
    </>
  );
}
