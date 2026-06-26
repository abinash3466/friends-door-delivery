import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import WorkerDashboard from './pages/WorkerDashboard';
import StoreManager from './pages/StoreManager';
import FoodPage from './pages/FoodPage';
import GroceryPage from './pages/GroceryPage';
import BikeTaxiPage from './pages/BikeTaxiPage';
import CustomStoreOrder from './pages/CustomStoreOrder';

const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFB] dark:bg-[#121214]">
        <div className="w-10 h-10 border-2 border-brand-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to correct dashboard based on role
  if (user.role === 'OWNER') {
    return <Navigate to="/owner" replace />;
  } else if (user.role === 'WORKER') {
    return <Navigate to="/worker" replace />;
  } else {
    return <Navigate to="/customer" replace />;
  }
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Authentication */}
          <Route path="/login" element={<Login />} />

          {/* Customer routes */}
          <Route
            path="/customer"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <FoodPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grocery"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <GroceryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bike-taxi"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <BikeTaxiPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/custom-order"
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER']}>
                <CustomStoreOrder />
              </ProtectedRoute>
            }
          />

          {/* Owner/Admin routes */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/store-manager"
            element={
              <ProtectedRoute allowedRoles={['OWNER']}>
                <StoreManager />
              </ProtectedRoute>
            }
          />

          {/* Worker/Delivery routes */}
          <Route
            path="/worker"
            element={
              <ProtectedRoute allowedRoles={['WORKER']}>
                <WorkerDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* Fallback redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
