import React, { useEffect, useState } from 'react';
import '../styles/style_account.css';
import { Navigate } from 'react-router-dom';

const Account = () => {
  const [user, setUser] = useState(null);
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Verwijder het token
    Navigate.push('/login'); // Redirect naar de loginpagina
  };
  

  useEffect(() => {
    const fetchAccountInfo = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      const response = await fetch('http://localhost:5000/account', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        alert('Fout bij ophalen accountgegevens.');
      }
    };
    fetchAccountInfo();
  }, []);

  

  if (!user) return null;

  return (
    <div className="account-container">
      <h1>Mijn Account</h1>
      <div id="user-info">
        <p><strong>Gebruikersnaam:</strong> {user.username}</p>
        <p><strong>Gespeelde games:</strong> {user.gamesPlayed}</p>
        <p><strong>Totale score:</strong> {user.totalScore}</p>
        <p><strong>Beste score:</strong> {user.bestScore}</p>
      </div>
      <h2>Behaalde Badges</h2>
      <ul id="achievements-list">
        {user.achievements.map((achievement, index) => (
          <li key={index}>{achievement}</li>
        ))}
      </ul>
      <button onClick={handleLogout}>Uitloggen</button>
    </div>
  );
};

export default Account;