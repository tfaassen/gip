import React from 'react';
import '../styles/style_multiplayer.css';

const Multiplayer = () => {
  return (
    <div id="multiplayer-container">
      <h1>Welkom bij de Multiplayer van Geozoekkr</h1>
      <p>Speel tegen andere spelers en kijk wie de beste locatiezoeker is!</p>
      <button onClick={() => window.location.href='/locatie'}>Start Multiplayer</button>
    </div>
  );
};

export default Multiplayer;