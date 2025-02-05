import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import StartPage from "./pages/Startpagina.js";
import GamePage from "./pages/locatie.js";
import ResultPage from "./pages/Resultaat.js";
import Singleplayer from "./pages/singleplayer.js";
import "./styles/style_startpagina.css";
import "./styles/style_locatie.css";
import "./styles/style_resultaat.css";
import "./styles/style_singleplayer.css";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/singleplayer" element={<Singleplayer />} />
                <Route path="/game" element={<GamePage />} />
                <Route path="/result" element={<ResultPage />} />
            </Routes>
        </Router>
    );
}

export default App;