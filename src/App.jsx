// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './components/common/Toast';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Dashboard from './components/dashboard/Dashboard';
import Faculty from './components/faculty/Faculty';
import RoomConfig from './components/rooms/RoomConfig';
import Schedule from './components/schedule/Schedule';
import Leaves from './components/leaves/Leaves';
import Allocate from './components/allocate/Allocate';
import Seating from './components/seating/Seating';
import StudentDashboard from './pages/StudentDashboard';
import MySeat from './pages/MySeat';

// ── Route Guards ───────────────────────────────────────────────────
function RequireAuth({ allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center font-mono text-[#7d8590]">
        Loading...
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'student' ? '/student' : '/'} replace />;
  }
  return <Outlet />;
}

// ── Shared App Layout ──────────────────────────────────────────────
function AppLayout() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <Topbar />
      <div className="flex" style={{ minHeight: 'calc(100vh - 56px)' }}>
        <Sidebar />
        <div className="flex-1 p-7 overflow-y-auto min-h-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

// ── Root Routes ────────────────────────────────────────────────────
function AppRoutes() {
  const { user } = useAuth();
  const defaultRedirect = user?.role === 'student' ? '/student' : '/';

  return (
    <Routes>
      {/* Public */}
      <Route
        path="/login"
        element={user ? <Navigate to={defaultRedirect} replace /> : <Login />}
      />

      {/* Admin / Faculty */}
      <Route element={<RequireAuth allowedRoles={['admin', 'faculty']} />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/faculty" element={<Faculty />} />
          <Route path="/rooms" element={<RoomConfig />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/leaves" element={<Leaves />} />
          <Route path="/allocate" element={<Allocate />} />
          <Route path="/seating" element={<Seating />} />
        </Route>
      </Route>

      {/* Student */}
      <Route element={<RequireAuth allowedRoles={['student']} />}>
        <Route element={<AppLayout />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/seat" element={<MySeat />} />
          <Route path="/student/schedule" element={<StudentDashboard />} />
        </Route>
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? defaultRedirect : '/login'} replace />} />
    </Routes>
  );
}

// ── Root App ───────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ToastProvider>
            <AppRoutesWrapper />
          </ToastProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

// Wrapper so AppRoutes can call useAuth inside AuthProvider
function AppRoutesWrapper() {
  return <AppRoutes />;
}
