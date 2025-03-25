import React, { useState } from 'react';
import '../styles/style_login.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await response.json();
    if (response.ok) {
      setMessage('Registratie succesvol! <a href="/login">Log in</a>');
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="login-container">
      <h1>Registreren</h1>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Gebruikersnaam" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Registreer</button>
      </form>
      <p>Al een account? <a href="/login">Log in</a></p>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;