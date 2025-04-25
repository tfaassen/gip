import React, { useState } from 'react';
import '../styles/style_login.css';
import { Navigate, useNavigate } from 'react-router-dom';


  

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Zorg ervoor dat cookies worden meegestuurd
        body: JSON.stringify({ username, password }),
      });
  
      if (!response.ok) {
        throw new Error('Login mislukt');
      }
  
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        navigate('/home');
      } else {
        alert('Inloggen mislukt, controleer je gegevens');
      }
    } catch (error) {
      console.error('Fout bij inloggen:', error);
      alert('Kan geen verbinding maken met de server.');
    }
  };

  return (
    <div>
      <h2>Inloggen</h2>
      <form onSubmit={handleLogin}>
        <label>
          Gebruikersnaam:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <br />
        <label>
          Wachtwoord:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <br />
        <button type="submit">Inloggen</button>
      </form>
      <p>Nog geen account? <a href="/register">Registreer hier</a></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default Login;