import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/style_lobby.css";

const socket = io('http://localhost:5000'); // Verbind met de backend

const Lobby = () => {
  const location = useLocation();
  const [lobbyId, setLobbyId] = useState(location.state?.lobbyId || ''); // Haal lobbyId op uit de state
  const [username, setUsername] = useState(location.state?.username || ''); // Haal username op uit de state
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!lobbyId) {
      alert("Lobby ID ontbreekt!");
      navigate('/multiplayer');
      return;
    }
  
    socket.on('lobby_update', (data) => {
      console.log("Lobby update ontvangen:", data);
      setPlayers(data.players);
    });
  
    return () => {
      socket.off('lobby_update');
    };
  }, [lobbyId, navigate]);

  const startGame = () => {
    if (!lobbyId) {
      alert("Lobby ID ontbreekt!");
      return;
    }

    const randomLocation = {
      lat: (Math.random() * 180 - 90).toFixed(6),
      lng: (Math.random() * 360 - 180).toFixed(6),
    };

    console.log("Start spel met locatie:", randomLocation);
    socket.emit('start_game', { lobby_id: lobbyId, location: randomLocation });
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: '#f4f4f4', padding: '10px', borderRadius: '5px', boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <strong>Lobby ID:</strong> {lobbyId}
      </div>
      <h1>Lobby</h1>
      <h2>Spelers in de lobby:</h2>
      {players.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Gebruikersnaam</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Er zijn nog geen spelers in de lobby.</p>
      )}
      <button onClick={startGame}>Start Spel</button>
    </div>
  );
};

export default Lobby;