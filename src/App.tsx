import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Facilities from './pages/Facilities';
import { CircularProgress, Box } from '@mui/material';
import ToastDisplay from './components/common/ToastProvider';

const App: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <ToastDisplay />
      </>
    );
  }

  return (
    <>
      <DashboardLayout>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/users"
            element={
              user?.role === 'admin' || user?.role === 'supervisor' ? (
                <Users />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/facilities"
            element={
              user?.role === 'admin' || user?.role === 'supervisor' ? (
                <Facilities />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </DashboardLayout>
      <ToastDisplay />
    </>
  );
};

export default App;
