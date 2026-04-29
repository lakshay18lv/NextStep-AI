import React, { useState } from 'react';

const AuthPage = ({ mode, onSubmit, loading }) => {
  const isRegister = mode === 'register';
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email || !form.password || (isRegister && !form.name)) {
      setError('Please fill in all required fields.');
      return;
    }

    const result = await onSubmit(form, isRegister, setError);
    return result;
  };

  return (
    <section className="auth-page">
      <div className="auth-card">
        <h2>{isRegister ? 'Create your NextStep account' : 'Welcome back'}</h2>
        <p className="helper">
          {isRegister
            ? 'Build your interview plan in under 2 minutes.'
            : 'Pick up right where you left off.'}
        </p>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              className="input"
              name="name"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
            />
          )}
          <input
            className="input"
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
          />
          <input
            className="input"
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />
          {error && <div className="error">{error}</div>}
          <button className="button primary" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default AuthPage;
