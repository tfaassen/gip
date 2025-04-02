import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/style_startpagina.css';

const Spelmodus = () => {
  return (
    <div id="start-container">
      <h1>Welkom bij Geozoekkr</h1>
      <p>op deze pagina kan je kiezen welke spelmodus je wil spelen</p>
      <p>Kies je spelmodus:</p>
      <Link to="/singleplayer"><button>Singleplayer</button></Link>
      <Link to="/multiplayer"><button>Multiplayer</button></Link>
    </div>
  );
};

export default Spelmodus;