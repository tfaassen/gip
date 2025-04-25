import React, { useState } from 'react';
import {useNavigate } from 'react-router-dom';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const history = useNavigate();

  // Functie voor het registreren van een gebruiker
  const handleRegister = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/register', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          username: "testuser",
          password: "testpassword"
      })
    });
    const data = await response.json();
    console.log(data);


    // Basisvalidatie voor lege velden
    if (!username || !password || !confirmPassword) {
      setError('Alle velden moeten worden ingevuld');
      return;
    }

    // Controleer of de wachtwoorden overeenkomen
    if (password !== confirmPassword) {
      setError('De wachtwoorden komen niet overeen');
      return;
    }

    // Hier kun je verdere wachtwoordvalidatie toevoegen (bijv. lengte, complexiteit)

    try {
      // Verstuur een POST-aanroep naar de backend om de gebruiker te registreren
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        // Als de registratie succesvol is, stuur de gebruiker door naar de loginpagina
        history.push('/login');
      } else {
        setError(data.message || 'Er is iets misgegaan tijdens de registratie');
      }
    } catch (error) {
      setError('Er is een fout opgetreden. Probeer het later opnieuw.');
    }
  };

  return (
    <div className="register-container">
      <h2>Maak een nieuw account aan</h2>
      
      {/* Formulier voor registratie */}
      <form onSubmit={handleRegister}>
        <div>
          <label>Gebruikersnaam</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Voer je gebruikersnaam in"
          />
        </div>
        <div>
          <label>Wachtwoord</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Voer je wachtwoord in"
          />
        </div>
        <div>
          <label>Bevestig wachtwoord</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Bevestig je wachtwoord"
          />
        </div>
        <button type="submit" >Registreren</button>
      </form>

      {/* Foutmeldingen weergeven */}
      {error && <p className="error-message">{error}</p>}

      <p>
        Heb je al een account? <a href="/login">Log in hier</a>
      </p>
    </div>
  );
}

export default Register;
