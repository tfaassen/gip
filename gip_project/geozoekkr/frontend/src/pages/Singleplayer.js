import React from 'react';
import '../styles/style_singleplayer.css';

const Singleplayer = () => {
  return (
    <div id="main-container">
      <h1>Welkom bij de Singleplayer van Geozoekkr</h1>
      <p>Je wordt ergens op Street View geplaatst en hebt <strong>2 minuten en 30 seconden</strong> om de locatie te raden.</p>
      <p>Klik op de kaart om je gok te plaatsen. De afstand tot de echte locatie bepaalt je score!</p>
      <div className="score-info">
        <h2>Scoreberekening:</h2>
        <ul>
          <li><strong>-0 punten per km</strong> aftrekken voor de eerste 4 km</li>
          <li><strong>-1 punt per km</strong> aftrekken tot de 10 km</li>
          <li><strong>-5 punten per km</strong> aftrekken voor de eerste 100 km</li>
          <li><strong>-10 punten per km</strong> aftrekken voor de eerste 1000 km</li>
          <li><strong>-15 punten per km</strong> aftrekken voor de rest</li>
          <li><strong>Maximale score: 5000 punten</strong></li>
        </ul>
      </div>
      <p>Klik op de startknop om te beginnen!</p>
      <button onClick={() => window.location.href='/locatie'}>Start</button>
    </div>
  );
};

export default Singleplayer;