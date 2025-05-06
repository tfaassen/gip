import '../styles/style_multiplayer.css';
import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from "react-router-dom";

const socket = io('http://localhost:5000'); // Verbind met de backend

const Multiplayer = () => {
  const [lobbyId, setLobbyId] = useState('');
  const [username, setUsername] = useState('');
  const [availableLobbies, setAvailableLobbies] = useState([]); // Beschikbare lobby's
  const navigate = useNavigate();

  useEffect(() => {
    // Haal beschikbare lobby's op van de server
    socket.emit('get_lobbies');
    socket.on('lobbies_list', (lobbies) => {
      setAvailableLobbies(lobbies);
    });

    return () => {
      socket.off('lobbies_list');
    };
  }, []);

  const createLobby = () => {
    if (!username) {
      alert("Vul een gebruikersnaam in!");
      return;
    }

    const newLobbyId = Math.random().toString(36).substr(2, 9); // Genereer een unieke lobby ID
    socket.emit('create_lobby', { lobby_id: newLobbyId, username });
    navigate('/lobby', { state: { lobbyId: newLobbyId, username } });
  };

  const joinLobby = (lobbyId) => {
    if (!username) {
      alert("Vul een gebruikersnaam in!");
      return;
    }

    socket.emit('join_lobby', { lobby_id: lobbyId, username });
    navigate('/lobby', { state: { lobbyId, username } });
  };

  return (
    <div id="multiplayer-container">
      <h1>Multiplayer Pre-Lobby</h1>
      <p>Bekijk beschikbare lobby's of maak een nieuwe aan.</p>
      <input
        type="text"
        placeholder="Gebruikersnaam"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button onClick={createLobby}>Maak Nieuwe Lobby</button>
      <h2>Beschikbare Lobby's:</h2>
      {availableLobbies.length > 0 ? (
        <ul>
          {availableLobbies.map((lobby) => (
            <li key={lobby.id}>
              Lobby ID: {lobby.id} - Spelers: {lobby.players.length}
              <button onClick={() => joinLobby(lobby.id)}>Join</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Er zijn momenteel geen beschikbare lobby's.</p>
      )}
    </div>
  );
};

export default Multiplayer;