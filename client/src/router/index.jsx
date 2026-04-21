import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelector from '../pages/auth/RoleSelector';
import Login from '../pages/auth/Login';
import PatientLayout from '../layouts/PatientLayout';
import PatientHome from '../pages/patient/Home';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/auth/select-role" replace />} />
      <Route path="/auth/select-role" element={<RoleSelector />} />
      <Route path="/auth/login" element={<Login />} />

      {/* Patient routes */}
      <Route path="/patient" element={<PatientLayout />}>
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<PatientHome />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
