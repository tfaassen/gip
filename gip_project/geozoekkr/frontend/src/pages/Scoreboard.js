import React, { useEffect, useState } from 'react';
import styles from '../styles/style_scoreboard.module.css';

const Scoreboard = () => {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/scoreboard')
      .then(response => response.json())
      .then(data => setScores(data));
  }, []);

  return (
    <div className={styles.scoreboardContainer}>
      <h1 className={styles.title}>Scoreboard</h1>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Gebruiker</th>
            <th>Totale Score</th>
            <th>Beste Score</th>
            <th>Gespeelde Games</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((score, index) => (
            <tr key={index}>
              <td>{score.username}</td>
              <td>{score.total_score}</td>
              <td>{score.best_score}</td>
              <td>{score.games_played}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <a href="/" className={styles.backLink}>Terug naar Start</a>
    </div>
  );
};

export default Scoreboard;