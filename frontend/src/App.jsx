// Version: 0.2.0
import React from 'react';
import Board from './components/Board';
import StandupList from './components/StandupList';
import AbsenceCalendar from './components/AbsenceCalendar';

export default function App() {
  const path = window.location.pathname;
  if (path === '/standups') return <StandupList />;
  if (path === '/absences') return <AbsenceCalendar />;
  return <Board />;
}
