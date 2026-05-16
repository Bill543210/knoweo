import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Learn from './pages/Learn';
import PublicProfile from './pages/PublicProfile';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
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
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/profile/:id" element={<PrivateRoute><PublicProfile /></PrivateRoute>} />
          <Route path="/learn" element={<PrivateRoute><Learn /></PrivateRoute>} />
          <Route path="/battles" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/friends" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/leaderboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/about" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;