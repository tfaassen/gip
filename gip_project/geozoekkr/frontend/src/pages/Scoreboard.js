import React, { useEffect, useState } from 'react';
import '../styles/style_scoreboard.css';

const Scoreboard = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('/scoreboard')
      .then(response => response.json())
      .then(data => setScores(data));
  }, []);

  return (
    <div>
      <h1>Scoreboard</h1>
      <table border="1">
        <thead>
          <tr>
            <th>Gebruiker</th>
            <th>Score</th>
            <th>Tijd</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => (
            <tr key={index}>
              <td>{score.username}</td>
              <td>{score.score}</td>
              <td>{score.time} sec</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/">Terug naar Start</a>
    </div>
  );
};

export default Scoreboard;