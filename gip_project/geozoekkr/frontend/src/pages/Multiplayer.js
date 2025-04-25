import '../styles/style_multiplayer.css';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from "react-router-dom";

const socket = io('http://localhost:5000'); // Verbind met de backend
const Multiplayer = () => {

  
    const [lobbyId, setLobbyId] = useState('');
    const [username, setUsername] = useState('');
    const [players, setPlayers] = useState([]);
    const navigate = useNavigate(); // Verplaats naar binnen de component
  
    useEffect(() => {
      socket.on('lobby_update', (data) => {
        setPlayers(data.players);
      });
  
      socket.on('game_started', (data) => {
        navigate('/multiplayer-game', { state: { location: data.location, players } });
      });
  
      return () => {
        socket.off('lobby_update');
        socket.off('game_started');
      };
    }, [navigate, players]);
  
    const createLobby = () => {
      if (!lobbyId || !username) {
        alert("Vul een gebruikersnaam en lobby ID in!");
        return;
      }
    
      socket.emit('create_lobby', { lobby_id: lobbyId, username });
      navigate('/lobby', { state: { lobbyId, username } });
    };
    
    const joinLobby = () => {
      if (!lobbyId || !username) {
        alert("Vul een gebruikersnaam en lobby ID in!");
        return;
      }
    
      socket.emit('join_lobby', { lobby_id: lobbyId, username });
      navigate('/lobby', { state: { lobbyId, username } });
    };
  
    
  
    return (
      <div id="multiplayer-container">
      <h1>Welkom bij de Multiplayer van Geozoekkr</h1>
      <p>Speel tegen andere spelers en kijk wie de beste locatiezoeker is!</p>
      
        <h1>Lobby</h1>
        <input
          type="text"
          placeholder="Gebruikersnaam"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="text"
          placeholder="Lobby ID"
          value={lobbyId}
          onChange={(e) => setLobbyId(e.target.value)}
        />
        <button onClick={createLobby} >Maak Lobby</button>
        <button onClick={joinLobby} >Join Lobby</button>
      </div>
    );
  };

export default Multiplayer;