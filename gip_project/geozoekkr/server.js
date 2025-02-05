const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let gameRooms = {}; // Object om actieve kamers bij te houden

io.on("connection", (socket) => {
    console.log("Een speler is verbonden:", socket.id);

    socket.on("createRoom", (roomCode) => {
        if (!gameRooms[roomCode]) {
            gameRooms[roomCode] = { players: [], guesses: [] };
        }
        gameRooms[roomCode].players.push(socket.id);
        socket.join(roomCode);
        io.to(roomCode).emit("playerJoined", gameRooms[roomCode].players.length);
    });

    socket.on("sendGuess", ({ roomCode, guess }) => {
        gameRooms[roomCode].guesses.push(guess);
        io.to(roomCode).emit("updateGuesses", gameRooms[roomCode].guesses);
    });

    socket.on("disconnect", () => {
        for (let room in gameRooms) {
            gameRooms[room].players = gameRooms[room].players.filter(id => id !== socket.id);
            io.to(room).emit("playerLeft", gameRooms[room].players.length);
        }
        console.log("Een speler is vertrokken:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server draait op poort 3000");
});
socket.on("sendGuess", ({ roomCode, guess }) => {
    gameRooms[roomCode].guesses.push(guess);
    if (gameRooms[roomCode].guesses.length === gameRooms[roomCode].players.length) {
        io.to(roomCode).emit("gameOver", gameRooms[roomCode].guesses);
    }
});
