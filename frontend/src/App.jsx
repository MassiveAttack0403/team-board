// Version: 0.5.0
import React from 'react';
import Board from './components/Board';
import StandupList from './components/StandupList';
import PlanCalendar from './components/PlanCalendar';
import Partnering from './components/Partnering';
import StundenStatistik from './components/StundenStatistik';
import SrStatistik from './components/SrStatistik';

function Nav() {
  const path = window.location.pathname;
  return (
    <nav>
      <a href="/" className={path === '/' ? 'nav-active' : ''}>Team</a>
      <a href="/plan" className={path === '/plan' ? 'nav-active' : ''}>Plan</a>
      <a href="/partnering" className={path === '/partnering' ? 'nav-active' : ''}>Partnering</a>
      <a href="/stunden" className={path === '/stunden' ? 'nav-active' : ''}>Stunden</a>
      <a href="/sr" className={path === '/sr' ? 'nav-active' : ''}>SR Statistik</a>
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
      {path === '/standups'  ? <StandupList /> :
       path === '/plan'      ? <PlanCalendar /> :
       path === '/partnering'? <Partnering /> :
       path === '/stunden'   ? <StundenStatistik /> :
       path === '/sr'        ? <SrStatistik /> :
       <Board />}
    </>
  );
}
