import React, { useState } from 'react';
import '../styles/style_login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      window.location.href = '/account';
    } else {
      setError(data.error);
    }
  };

  return (
    <div className="login-container">
      <h1>Geozoekkr</h1>
      <h2>Inloggen</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Gebruikersnaam" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Inloggen</button>
      </form>
      <p>Nog geen account? <a href="/register">Registreer hier</a></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;