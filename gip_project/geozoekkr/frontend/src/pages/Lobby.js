import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/style_lobby.css";

const socket = io('http://localhost:5000'); // Verbind met de backend

const Lobby = () => {
  const location = useLocation();
  const state = location.state || {}; // Voeg een fallback toe
  const [lobbyId, setLobbyId] = useState(state.lobbyId || '');
  const [username, setUsername] = useState(state.username || '');
  const [players, setPlayers] = useState([]);
  const [host, setHost] = useState(null); // Houd bij wie de host is
  const navigate = useNavigate();
  
    
 

  useEffect(() => {
    if (!lobbyId) {
      alert("Lobby ID ontbreekt!");
      navigate('/multiplayer');
      return;
    }
  
    const handleGameStarted = (data) => {
      console.log("🎮 Game gestart met data:", data);
      navigate('/multiplayer-game', {
        state: {
          lobbyId: data.lobby_id,
          username: data.username,
          location: data.location, // Zorg ervoor dat de locatie wordt meegegeven
          host: data.host,
          players: data.players,
        },
      });
    };
  
    socket.on('game_started', handleGameStarted);
  
    return () => {
      socket.off('game_started', handleGameStarted);
    };
  }, [lobbyId, navigate]);
  useEffect(() => {
    if (!lobbyId) {
      alert("Lobby ID ontbreekt!");
      navigate('/multiplayer');
      return;
    }
  
  

    socket.emit('join_lobby', { lobby_id: lobbyId, username });

    socket.on('lobby_update', (data) => {
      if (data.players.length > 12) {
        alert("De lobby is vol! Maximaal 12 spelers toegestaan.");
        navigate('/multiplayer');
        return;
      }
      setPlayers(data.players); // Update de lijst met spelers
      setHost(data.host); // Stel de host in
    });

    // Luister naar het game_started-event
    socket.on('game_started', (data) => {
      navigate('/multiplayer-game', { state: { lobbyId: data.lobby_id, username: data.username } });
    });

    return () => {
      socket.off('game_started');
      socket.off('lobby_update');
    };
  }, [lobbyId, username, navigate]);
  useEffect(() => {
    socket.on('lobby_update', (data) => {
      setPlayers(data.players);
      setHost(data.host); // Stel de host in
    });
    
    return () => {
      socket.off('lobby_update');
    };
  }, []);

  const startGame = () => {
    if (players.length < 2) {
      alert("Er moeten minimaal 2 spelers in de lobby zijn om het spel te starten!");
      return;
    }
  
    socket.emit("start_game", { lobby_id: lobbyId, username });
  };

  return (
    <div>
      <h1>Lobby</h1>
      <h2>Lobby ID: {lobbyId}</h2>
      <h2>Spelers in de lobby:</h2>
      {players.length > 0 ? (
        <ul>
          {players.map((player, index) => (
            <li
              key={index}
              className={`player-item ${
                player === username ? 'current-user' : ''
              } ${player === host ? 'host' : ''}`}
            >
              {player} {player === host && '(Host)'}
            </li>
          ))}
        </ul>
      ) : (
        <p>Er zijn nog geen spelers in de lobby.</p>
      )}
      <button onClick={startGame}>Start Spel</button>
    </div>
  );
};

export default Lobby;