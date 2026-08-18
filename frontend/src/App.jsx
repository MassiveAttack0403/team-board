// Version: 0.1.0
import React from 'react';
import Board from './components/Board';
import StandupList from './components/StandupList';

export default function App() {
  const path = window.location.pathname;
  if (path === '/standups') return <StandupList />;
  return <Board />;
}
