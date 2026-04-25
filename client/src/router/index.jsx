import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelector from '../pages/auth/RoleSelector';
import Login from '../pages/auth/Login';
import PatientLayout from '../layouts/PatientLayout';
import PatientHome from '../pages/patient/Home';
import SearchResults from '../pages/patient/SearchResults';
import MedicineDetail from '../pages/patient/MedicineDetail';
import Reservation from '../pages/patient/Reservation';
import VendorLayout from '../layouts/VendorLayout';
import VendorDashboard from '../pages/vendor/Dashboard';
import VendorInventory from '../pages/vendor/Inventory';

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
        <Route path="search" element={<SearchResults />} />
        <Route path="medicine/:id" element={<MedicineDetail />} />
        <Route path="reserve/:medicineId" element={<Reservation />} />
      </Route>

      {/* Vendor routes */}
      <Route path="/vendor" element={<VendorLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<VendorDashboard />} />
        <Route path="inventory" element={<VendorInventory />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
