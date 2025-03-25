import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Singleplayer from './pages/Singleplayer';
import Multiplayer from './pages/Multiplayer';
import Scoreboard from './pages/Scoreboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Locatie from './pages/Locatie';
import Resultaat from './pages/Resultaat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/singleplayer" element={<Singleplayer />} />
        <Route path="/multiplayer" element={<Multiplayer />} />
        <Route path="/scoreboard" element={<Scoreboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account" element={<Account />} />
        <Route path="/locatie" element={<Locatie />} />
        <Route path="/resultaat" element={<Resultaat />} />
      </Routes>
    </Router>
  );
}

export default App;