import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Route protection based on authentication and roles.
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFB] dark:bg-[#121214]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-teal/20 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-teal animate-spin"></div>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user role is not allowed, redirect to their default home page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'OWNER') {
      return <Navigate to="/owner" replace />;
    } else if (user.role === 'WORKER') {
      return <Navigate to="/worker" replace />;
    } else {
      return <Navigate to="/customer" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
