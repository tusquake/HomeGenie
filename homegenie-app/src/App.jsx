import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import ResidentDashboard from './pages/ResidentDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';

const ROLE_ROUTES = { ADMIN: '/admin', RESIDENT: '/resident', TECHNICIAN: '/technician' };

const HomeRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_ROUTES[user.role] || '/login'} replace />;
};

const App = () => (
  <>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      <Route path="/resident" element={
        <ProtectedRoute allowedRoles={['RESIDENT']}>
          <ResidentDashboard />
        </ProtectedRoute>
      } />

      <Route path="/technician" element={
        <ProtectedRoute allowedRoles={['TECHNICIAN']}>
          <TechnicianDashboard />
        </ProtectedRoute>
      } />

      <Route path="*" element={<HomeRedirect />} />
    </Routes>

    <ToastContainer position="bottom-right" autoClose={5000} />
  </>
);

export default App;