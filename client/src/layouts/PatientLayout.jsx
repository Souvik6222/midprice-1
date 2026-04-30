import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function PatientLayout() {
  const logout   = useAuthStore(s => s.logout);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/auth/select-role'); };

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', position: 'relative' }}>
      <Outlet />
    </div>
  );
}

export default PatientLayout;
