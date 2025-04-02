import React , { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from './pages/PrivateRoute'; // Importeer PrivateRoute
import './App.css';


import Home from './pages/Home';
import Singleplayer from './pages/Singleplayer';
import Multiplayer from './pages/Multiplayer';
import Scoreboard from './pages/Scoreboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import Locatie from './pages/Locatie';
import Resultaat from './pages/Resultaat';
import Spelmodus from './pages/Spelmodus';


// Gebruik CORS-middleware


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />}  />
        {/* Beveiligde routes */}
        <Route path="/spelmodus" element={<PrivateRoute authenticated={isAuthenticated} element={<Spelmodus />} />} />
        <Route path="/singleplayer" element={<PrivateRoute authenticated={isAuthenticated} element={<Singleplayer />} />} />
        <Route path="/multiplayer" element={<PrivateRoute authenticated={isAuthenticated} element={<Multiplayer />} />} />
        <Route path="/scoreboard" element={<PrivateRoute authenticated={isAuthenticated} element={<Scoreboard />} />} />
        <Route path="/account" element={<PrivateRoute authenticated={isAuthenticated} element={<Account />} />} />
        <Route path="/locatie" element={<PrivateRoute authenticated={isAuthenticated} element={<Locatie />} />} />
        <Route path="/resultaat" element={<PrivateRoute authenticated={isAuthenticated} element={<Resultaat />} />} />
        < Route path="/" element={<Navigate to="/home" />} />
      </Routes>
    </Router>
  );
}

export default App;