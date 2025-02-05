import React from "react";
import { useNavigate } from "react-router-dom";
import "./style_startpagina.css";

const StartPage = () => {
  const navigate = useNavigate();

  return (
    <div className="start-container">
      <h1>Welkom bij Geozoekkr</h1>
      <p>
        In dit spel ga je een locatie raden op basis vanuit Google
        Street View. Kun jij het juiste punt vinden?
      </p>
      <p>Klik op de knop hieronder om te beginnen met de singleplayer-modus.</p>
      <button onClick={() => navigate("/singleplayer")}>
        Singleplayer
      </button>
    </div>
  );
};

export default StartPage;