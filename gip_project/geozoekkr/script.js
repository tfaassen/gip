const socket = io("http://localhost:3000"); // Verbind met de WebSocket-server
let gameId;

// **Speler joint een game**
function joinGame() {
    const playerName = document.getElementById("player-name").value;
    gameId = document.getElementById("game-id").value;

    if (!playerName || !gameId) {
        alert("Voer je naam en een game ID in!");
        return;
    }

    socket.emit("joinGame", { playerName, gameId });
    document.getElementById("lobby-container").style.display = "none";
    document.getElementById("multiplayer-container").style.display = "block";
}

// **Ontvang updates van spelers in de game**
socket.on("updatePlayers", (players) => {
    const playerList = document.getElementById("player-list");
    playerList.innerHTML = "";
    players.forEach((player) => {
        const li = document.createElement("li");
        li.textContent = player.name;
        playerList.appendChild(li);
    });
});

// **Score versturen**
function submitScore() {
    const params = new URLSearchParams(window.location.search);
    const playerName = document.getElementById("player-name").value;
    const distance = params.get("distance");
    const score = params.get("score");
    const time = params.get("time");

    socket.emit("submitScore", { gameId, playerName, distance, score, time });
}

// **Winnaar ontvangen en tonen**
socket.on("gameResults", (results) => {
    let winner = results.reduce((best, player) => (player.score > best.score ? player : best), results[0]);

    document.getElementById("winner-result").innerText = `Winnaar: ${winner.playerName}`;
});

// **Leaderboard ophalen**
function viewLeaderboard() {
    fetch("http://localhost:3000/leaderboard")
        .then((response) => response.json())
        .then((leaderboard) => {
            const leaderboardList = document.getElementById("leaderboard-list");
            leaderboardList.innerHTML = "";
            leaderboard.forEach((entry, index) => {
                const li = document.createElement("li");
                li.textContent = `${index + 1}. ${entry.playerName} - Score: ${entry.score}`;
                leaderboardList.appendChild(li);
            });
            document.getElementById("leaderboard").style.display = "block";
        })
        .catch((error) => console.error("Fout bij leaderboard ophalen:", error));
}
