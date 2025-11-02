import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', { username, password });
      if (response.ok) {
        onLogin(response.data.token);
      } else {
        // Axios wraps errors, so we can access response data directly
        alert(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error.response ? error.response.data : error);
      alert(error.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>Welcome Back</h1>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input type="text" id="username" placeholder="your-username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="login-btn">
            Sign In
          </button>
        </form>
        <div className="login-footer" style={{ marginTop: '1.5rem' }}>
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;