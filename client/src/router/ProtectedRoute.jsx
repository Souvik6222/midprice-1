import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function ProtectedRoute({ role, children }) {
  const user = useAuthStore((state) => state.user);

  // Not logged in
  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  // Role mismatch — map "pharmacy" role to "vendor" for compatibility
  const userRole = user.role === 'pharmacy' ? 'vendor' : user.role;
  if (role && userRole !== role) {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
