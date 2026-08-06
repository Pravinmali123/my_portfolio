import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import PortfolioPage from './pages/PortfolioPage';
import AdminLoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './routes/ProtectedRoute';
import Toast from './components/Toast';
import Cursor from './components/Cursor';
import Loader from './components/Loader';
import { ToastProvider } from './context/ToastContext';

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminOverviewPage = lazy(() => import('./pages/admin/OverviewPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/ProjectsPage'));
const AdminSkillsPage = lazy(() => import('./pages/admin/SkillsPage'));
const AdminCertificationsPage = lazy(() => import('./pages/admin/CertificationsPage'));
const AdminAboutPage = lazy(() => import('./pages/admin/AboutPage'));
const AdminMessagesPage = lazy(() => import('./pages/admin/MessagesPage'));
const AdminSettingsPage = lazy(() => import('./pages/admin/SettingsPage'));

const App = () => {
  return (
    <ToastProvider>
      <Cursor />
      <Loader />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<PortfolioPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<AdminOverviewPage />} />
            <Route path="projects" element={<AdminProjectsPage />} />
            <Route path="skills" element={<AdminSkillsPage />} />
            <Route path="certifications" element={<AdminCertificationsPage />} />
            <Route path="about" element={<AdminAboutPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toast />
    </ToastProvider>
  );
};

export default App;
