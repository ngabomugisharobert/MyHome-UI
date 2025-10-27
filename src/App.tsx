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
import TeamManagement from './pages/TeamManagement';
import RoleManagement from './pages/RoleManagement';
import AccessManagement from './pages/AccessManagement';
import FacilityUsers from './pages/facility/FacilityUsers';
import FacilityResidents from './pages/facility/FacilityResidents';
import FacilityContacts from './pages/facility/FacilityContacts';
import FacilityDocuments from './pages/facility/FacilityDocuments';
import FacilityTasks from './pages/facility/FacilityTasks';
import FacilityInspections from './pages/facility/FacilityInspections';
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
          <Route
            path="/team-management"
            element={
              user?.role === 'admin' || user?.role === 'supervisor' ? (
                <TeamManagement />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/role-management"
            element={
              user?.role === 'admin' ? (
                <RoleManagement />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/access-management"
            element={
              user?.role === 'admin' || user?.role === 'supervisor' ? (
                <AccessManagement />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          {/* Facility-specific routes for users with facilityId */}
          <Route
            path="/facility/residents"
            element={
              user?.facilityId ? (
                <FacilityResidents />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/facility/contacts"
            element={
              user?.facilityId ? (
                <FacilityContacts />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/facility/documents"
            element={
              user?.facilityId ? (
                <FacilityDocuments />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/facility/tasks"
            element={
              user?.facilityId ? (
                <FacilityTasks />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/facility/inspections"
            element={
              user?.facilityId ? (
                <FacilityInspections />
              ) : (
                <Navigate to="/dashboard" replace />
              )
            }
          />
          <Route
            path="/facility/users"
            element={
              user?.facilityId ? (
                <FacilityUsers />
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
