import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { seedDemoData, seedDummyAdmissions } from './utils/demoData';

import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import StudentsPage from './pages/StudentsPage';
import StudentFormPage from './pages/StudentFormPage';
import StudentDetailPage from './pages/StudentDetailPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import SettingsPage from './pages/SettingsPage';
import VerificationPage from './pages/VerificationPage';
import NotFoundPage from './pages/NotFoundPage';
import FlowchartPage from './pages/FlowchartPage';
import AdmissionFormsPage from './pages/AdmissionFormsPage';
import Stage1VerificationPage from './pages/Stage1VerificationPage';
import Stage2VerificationPage from './pages/Stage2VerificationPage';
import StageCertificateVerificationPage from './pages/StageCertificateVerificationPage';

// Seed demo data on first load
seedDemoData();
// Append dummy admission records for Form A / B / C testing (never overwrites real data)
seedDummyAdmissions();

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-8 h-8 border-2 border-blue-700 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'Admin') return <Navigate to="/" replace />;

  return children;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="students/new" element={<StudentFormPage />} />
        <Route path="students/:id" element={<StudentDetailPage />} />
        <Route path="students/:id/edit" element={<StudentFormPage />} />
        <Route path="verify" element={<VerificationPage />} />
        <Route path="reports" element={<ProtectedRoute adminOnly><ReportsPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute adminOnly><UsersPage /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute adminOnly><SettingsPage /></ProtectedRoute>} />
        <Route path="flowchart" element={<FlowchartPage />} />
        <Route path="admission-forms" element={<AdmissionFormsPage />} />
        <Route path="verification/stage-1" element={<Stage1VerificationPage />} />
        <Route path="verification/stage-2/:studentId" element={<Stage2VerificationPage />} />
        <Route path="verification/stage-3/:studentId" element={<StageCertificateVerificationPage stageNumber={3} />} />
        <Route path="verification/stage-4/:studentId" element={<StageCertificateVerificationPage stageNumber={4} />} />
        <Route path="verification/stage-5/:studentId" element={<StageCertificateVerificationPage stageNumber={5} />} />
        <Route path="verification/stage-6/:studentId" element={<StageCertificateVerificationPage stageNumber={6} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <AppRoutes />
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
