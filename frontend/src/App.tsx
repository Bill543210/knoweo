import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Learn from './pages/Learn';
import LearningHub from './pages/LearningHub';
import ModeSelector from './pages/ModeSelector';
import PublicProfile from './pages/PublicProfile';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Landing from './pages/Landing';
import CareersPage from './pages/Careers';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#F8FAFF',
    }}>
      <p style={{ color: '#64748B' }}>Chargement...</p>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return !user ? <>{children}</> : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile"      element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:id"  element={<PrivateRoute><PublicProfile /></PrivateRoute>} />

          {/* ── Parcours d'apprentissage ── */}
          <Route path="/learn"                    element={<PrivateRoute><LearningHub /></PrivateRoute>} />
          <Route path="/learn/:category"          element={<PrivateRoute><ModeSelector /></PrivateRoute>} />
          <Route path="/learn/:category/:mode"    element={<PrivateRoute><Learn /></PrivateRoute>} />

          <Route path="/battles"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/friends"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/about"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="*"            element={<Navigate to="/dashboard" replace />} />
          <Route path="/careers" element={<CareersPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;