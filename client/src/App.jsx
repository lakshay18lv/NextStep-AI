import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './components/Landing';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import FeedbackStudio from './components/FeedbackStudio';
import ProtectedRoute from './components/ProtectedRoute';

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const AuthWrapper = ({ mode, onAuth, loading }) => {
  const navigate = useNavigate();

  const handleSubmit = async (form, isRegister, setError) => {
    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      onAuth(data);
      navigate('/dashboard');
    } catch (err) {
      setError('Network error. Please try again.');
    }
  };

  return <AuthPage mode={mode} onSubmit={handleSubmit} loading={loading} />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const handleAuth = (data) => {
    setLoading(true);
    const { token: jwt, user: userData } = data;
    localStorage.setItem('token', jwt);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(jwt);
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <Router>
      <div className="app-shell">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<AuthWrapper mode="login" onAuth={handleAuth} loading={loading} />} />
          <Route path="/register" element={<AuthWrapper mode="register" onAuth={handleAuth} loading={loading} />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isAuthenticated={Boolean(token)}>
                <Dashboard user={user} token={token} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <ProtectedRoute isAuthenticated={Boolean(token)}>
                <FeedbackStudio token={token} />
              </ProtectedRoute>
            }
          />
        </Routes>
        <footer>Built for NextStep AI • Prepare smarter, not harder.</footer>
      </div>
    </Router>
  );
};

export default App;
