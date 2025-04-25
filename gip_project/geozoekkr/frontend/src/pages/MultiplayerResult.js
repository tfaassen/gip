import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const MultiplayerResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results || [];

  return (
    <div>
      <h1>Multiplayer Resultaten</h1>
      <table>
        <thead>
          <tr>
            <th>Speler</th>
            <th>Gok</th>
            <th>Afstand</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.username}</td>
              <td>{result.guess}</td>
              <td>{result.distance} km</td>
              <td>{result.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => navigate('/lobby')}>Terug naar Lobby</button>
    </div>
  );
};

export default MultiplayerResult;