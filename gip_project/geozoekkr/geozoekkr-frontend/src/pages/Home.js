import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/style_startpagina.css';

const Home = () => {
  return (
    <div id="start-container">
      <h1>Welkom bij Geozoekkr</h1>
      <p>In dit spel ga je een locatie raden op basis van een foto vanuit Google Street View. Kun jij het juiste punt vinden?</p>
      <p>Kies je spelmodus:</p>
      <Link to="/singleplayer"><button>Singleplayer</button></Link>
      <Link to="/multiplayer"><button>Multiplayer</button></Link>
      <Link to="/scoreboard"><button>Scorebord</button></Link>
      <Link to="/login"><button>Inloggen</button></Link>
    </div>
  );
};

export default Home;