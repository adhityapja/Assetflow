import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { Dashboard } from './features/dashboard/Dashboard';
import { AssetAllocation } from './features/assets/AssetAllocation';
import { BookingCalendar } from './features/bookings/BookingCalendar';
import { MaintenanceBoard } from './features/maintenance/MaintenanceBoard';
import { AuditCycle } from './features/audit/AuditCycle';
import { ReportsScreen } from './features/reports/ReportsScreen';
import { ActivityLogScreen } from './features/activity/ActivityLogScreen';
import { Login } from './features/auth/Login';
import { Signup } from './features/auth/Signup';
import { OrgSetup } from './features/org/OrgSetup';
import type { NavPage } from './types';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Protected Routes wrapped in AppLayout */}
      <Route path="/" element={<ProtectedRoute><AppLayoutWrapper /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assets" element={<AssetAllocation />} />
        <Route path="bookings" element={<BookingCalendar />} />
        <Route path="maintenance" element={<MaintenanceBoard />} />
        <Route path="audit" element={<AuditCycle />} />
        <Route path="reports" element={<ReportsScreen />} />
        <Route path="logs" element={<ActivityLogScreen />} />
        <Route path="org-setup" element={<OrgSetup />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Wrapper to bridge React Router and the existing AppLayout
function AppLayoutWrapper() {
  const location = useLocation();
  const path = location.pathname.split('/')[1] as NavPage;

  return (
    <AppLayout activePage={path || 'dashboard'} onNavigate={() => {}}>
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="assets" element={<AssetAllocation />} />
        <Route path="bookings" element={<BookingCalendar />} />
        <Route path="maintenance" element={<MaintenanceBoard />} />
        <Route path="audit" element={<AuditCycle />} />
        <Route path="reports" element={<ReportsScreen />} />
        <Route path="logs" element={<ActivityLogScreen />} />
        <Route path="org-setup" element={<OrgSetup />} />
      </Routes>
    </AppLayout>
  );
}

export default App;