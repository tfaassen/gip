import React, { useEffect, useState } from 'react';
import '../styles/style_account.css';
import { useNavigate } from 'react-router-dom';

const Account = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  useEffect(() => {
    const fetchAccountInfo = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await fetch('http://localhost:5000/account', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
      } else {
        alert(data.error || 'Fout bij ophalen accountgegevens.');
      }
    };
    fetchAccountInfo();
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="account-container">
      <h1>Mijn Account</h1>
      <div id="user-info">
        <p><strong>Gebruikersnaam:</strong> {user.username}</p>
        <p><strong>Gespeelde games:</strong> {user.gamesPlayed}</p>
        <p><strong>Totale score:</strong> {user.totalScore}</p>
        <p><strong>Beste score:</strong> {user.bestScore}</p>
        <p><strong>Kortste tijd:</strong> {user.shortestTime}</p>
        <p><strong>Totale speeltijd:</strong> {user.totalPlayTime}</p>
      </div>
      <button onClick={() => navigate('/home')}>Terug naar Home</button>
      <button onClick={handleLogout}>Uitloggen</button>
    </div>
  );
};

export default Account;