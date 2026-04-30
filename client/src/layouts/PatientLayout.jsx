import React from 'react';
import { Outlet } from 'react-router-dom';

function PatientLayout() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Outlet />
    </div>
  );
}

export default PatientLayout;
