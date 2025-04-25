from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import mysql.connector
from flask_cors import cross_origin 
from flask_socketio import SocketIO, join_room, leave_room, emit
from datetime import timedelta



load_dotenv()  # Laad de omgevingsvariabelen uit het .env-bestand

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})
app.secret_key = "jouw_geheime_sleutel"  # Zorg ervoor dat dit een veilige sleutel is
app.config['SESSION_TYPE'] = 'filesystem'  # Gebruik bestandssysteem voor sessies

socketio = SocketIO(app, cors_allowed_origins="*")
lobbies = {}
# Verbinding maken met MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",  # Verander dit naar jouw MySQL-gebruiker
    password="",  # Verander dit naar jouw MySQL-wachtwoord
    database="geozoekkr"
)

cursor = db.cursor(dictionary=True)  # Data als dictionary ophalen

# ✅ Homepagina


# ✅ Scoreboard
@app.route('/scoreboard')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def scoreboard():
    cursor.execute("""
        SELECT u.username, s.total_score, s.best_score, s.games_played
        FROM scores s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.total_score DESC
        LIMIT 10
    """)
    scores = cursor.fetchall()
    return jsonify(scores)

# ✅ Registreren
@app.route('/register', methods=['POST'])
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'], supports_credentials=True)
def register():
    data = request.json
    username = data['username']
    password = data['password']

    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if user:
        return jsonify({"error": "Gebruiker bestaat al!"}), 400

    from bcrypt import hashpw, gensalt
    hashed_password = hashpw(password.encode('utf-8'), gensalt())
    cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, hashed_password))
    db.commit()
    return jsonify({"message": "Registratie succesvol!"})

# ✅ Inloggen
import jwt  # Voeg dit bovenaan toe

@app.route('/login', methods=['POST'])
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'], supports_credentials=True)
def login():
    data = request.json
    username = data['username']
    password = data['password']

    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    from bcrypt import checkpw
    if user and checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        # Genereer een JWT-token
        token = jwt.encode({"username": username}, os.getenv('JWT_SECRET'), algorithm=os.getenv('JWT_ALGORITHM'))
        return jsonify({"token": token})
    else:
        return jsonify({"error": "Foute gebruikersnaam of wachtwoord!"}), 400
@app.route('/account')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'], supports_credentials=True)
def account():
    try:
        # Controleer de Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Geen geldige token!"}), 401

        # Decodeer de JWT-token
        token = auth_header.split(" ")[1]
        decoded = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=[os.getenv('JWT_ALGORITHM')])
        username = decoded.get('username')
        if not username:
            return jsonify({"error": "Ongeldige token!"}), 401

        # Haal de gebruiker op
        cursor.execute("SELECT id, username FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()
        if not user:
            return jsonify({"error": "Gebruiker niet gevonden!"}), 404

        user_id = user['id']

        # Haal scores op
        cursor.execute("SELECT games_played, total_score, best_score FROM scores WHERE user_id = %s", (user_id,))
        scores = cursor.fetchone() or {"games_played": 0, "total_score": 0, "best_score": 0}

        # ...existing code...

        # Haal speeltijden op
        cursor.execute("SELECT shortest_time, total_play_time FROM game_times WHERE user_id = %s", (user_id,))
        game_times = cursor.fetchone() or {"shortest_time": "00:00:00", "total_play_time": "00:00:00"}

        # Converteer timedelta naar string
        if isinstance(game_times['shortest_time'], timedelta):
            game_times['shortest_time'] = str(game_times['shortest_time'])
        if isinstance(game_times['total_play_time'], timedelta):
            game_times['total_play_time'] = str(game_times['total_play_time'])

# Combineer alle gegevens
        account_data = {
            "username": user['username'],
            "gamesPlayed": scores['games_played'],
            "totalScore": scores['total_score'],
            "bestScore": scores['best_score'],
            "shortestTime": game_times['shortest_time'],
            "totalPlayTime": game_times['total_play_time']
        }

        return jsonify(account_data)

    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token is verlopen!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Ongeldige token!"}), 401
    except Exception as e:
        print("Fout in /account route:", str(e))  # Log de fout voor debugging
        return jsonify({"error": "Interne serverfout"}), 500

# ✅ Uitloggen
@app.route('/logout')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'], supports_credentials=True)
def logout():
    session.pop('username', None)
    return jsonify({"message": "Uitgelogd!"})

@app.route('/locatie')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'], supports_credentials=True)
def locatie():
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    return jsonify({"api_key": api_key})

# ✅ Resultaatpagina
@app.route('/resultaat')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'], supports_credentials=True)
def resultaat():
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    distance = request.args.get('distance')
    startLat = request.args.get('startLat')
    startLng = request.args.get('startLng')
    selectedLat = request.args.get('selectedLat')
    selectedLng = request.args.get('selectedLng')
    time = request.args.get('time')
    score = request.args.get('score')
    return jsonify({
        "api_key": api_key,
        "distance": distance,
        "startLat": startLat,
        "startLng": startLng,
        "selectedLat": selectedLat,
        "selectedLng": selectedLng,
        "time": time,
        "score": score
    })

@app.route('/test-session')
def test_session():
    if 'username' in session:
        print(f"Sessie gevonden: {session}")  # Debugging
        return jsonify({"username": session['username']})
    print("Geen sessie gevonden.")  # Debugging
    return jsonify({"error": "Geen gebruiker ingelogd!"}), 401

@app.route('/save-game', methods=['POST'])
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'], supports_credentials=True)
def save_game():
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith("Bearer "):
        return jsonify({"error": "Geen geldige token!"}), 401

    token = auth_header.split(" ")[1]
    try:
        decoded = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=[os.getenv('JWT_ALGORITHM')])
        username = decoded['username']
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token is verlopen!"}), 401
    except jwt.InvalidTokenError:
        return jsonify({"error": "Ongeldige token!"}), 401

    data = request.json
    score = data['score']
    search_time = data['searchTime']  # Ontvang de verstreken tijd

    # Haal de user_id op
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"error": "Gebruiker niet gevonden!"}), 404

    user_id = user['id']

    # Update of voeg een record toe in de scores-tabel
    cursor.execute("SELECT * FROM scores WHERE user_id = %s", (user_id,))
    existing_score = cursor.fetchone()

    if existing_score:
        new_games_played = existing_score['games_played'] + 1
        new_total_score = existing_score['total_score'] + score
        new_best_score = max(existing_score['best_score'], score)

        cursor.execute("""
            UPDATE scores
            SET games_played = %s, total_score = %s, best_score = %s
            WHERE user_id = %s
        """, (new_games_played, new_total_score, new_best_score, user_id))
    else:
        cursor.execute("""
            INSERT INTO scores (user_id, games_played, total_score, best_score)
            VALUES (%s, %s, %s, %s)
        """, (user_id, 1, score, score))

    # Update of voeg een record toe in de game_times-tabel
    cursor.execute("SELECT * FROM game_times WHERE user_id = %s", (user_id,))
    existing_time = cursor.fetchone()

    if existing_time:
    # Zet search_time om naar een timedelta
        search_time_delta = timedelta(seconds=search_time)

        new_total_play_time = existing_time['total_play_time'] + search_time_delta
        new_shortest_time = min(existing_time['shortest_time'], search_time_delta)

        cursor.execute("""
            UPDATE game_times
            SET total_play_time = %s, shortest_time = %s
            WHERE user_id = %s
        """, (new_total_play_time, new_shortest_time, user_id))
    else:
    # Zet search_time om naar een timedelta
        search_time_delta = timedelta(seconds=search_time)

        cursor.execute("""
            INSERT INTO game_times (user_id, shortest_time, total_play_time)
            VALUES (%s, %s, %s)
        """, (user_id, search_time_delta, search_time_delta))

    db.commit()
    return jsonify({"message": "Game succesvol opgeslagen!"})
@app.after_request
def after_request(response):
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,POST,OPTIONS,DELETE,PUT'
    return response

# Maak een nieuwe lobby
@socketio.on('create_lobby')
def create_lobby(data):
    lobby_id = data['lobby_id']
    username = data['username']

    if lobby_id not in lobbies:
        lobbies[lobby_id] = {'players': [], 'location': None}

    if username not in lobbies[lobby_id]['players']:
        lobbies[lobby_id]['players'].append(username)

    join_room(lobby_id)
    emit('lobby_update', lobbies[lobby_id], room=lobby_id)

@socketio.on('join_lobby')
def join_lobby(data):
    lobby_id = data['lobby_id']
    username = data['username']

    if lobby_id in lobbies:
        if username not in lobbies[lobby_id]['players']:
            lobbies[lobby_id]['players'].append(username)

        join_room(lobby_id)
        emit('lobby_update', lobbies[lobby_id], room=lobby_id)
    else:
        emit('error', {'message': 'Lobby bestaat niet.'})
# Verwijder een speler uit een lobby
@socketio.on('leave_lobby')
def leave_lobby(data):
    lobby_id = data['lobby_id']
    username = data['username']

    if lobby_id in lobbies:
        lobbies[lobby_id]['players'].remove(username)
        leave_room(lobby_id)
        emit('lobby_update', lobbies[lobby_id], room=lobby_id)

# Start het spel in een lobby
@socketio.on('start_game')
def start_game(data):
    lobby_id = data['lobby_id']
    if lobby_id in lobbies:
        # Genereer een gedeelde locatie voor alle spelers
        location = get_random_location()
        lobbies[lobby_id]['location'] = location
        emit('game_started', {'location': location}, room=lobby_id)

def get_random_location():
    import random
    return {
        'lat': random.uniform(-90, 90),
        'lng': random.uniform(-180, 180)
    }

@socketio.on('submit_guess')
def submit_guess(data):
    lobby_id = data['lobby_id']
    username = data['username']
    guess = data['guess']

    if lobby_id in lobbies:
        if 'guesses' not in lobbies[lobby_id]:
            lobbies[lobby_id]['guesses'] = []

        lobbies[lobby_id]['guesses'].append({
            'username': username,
            'guess': guess
        })

        # Stuur een melding naar andere spelers dat deze speler heeft gegokt
        emit('player_guessed', {'username': username}, room=lobby_id, include_self=False)

        # Controleer of alle spelers hun gok hebben gemaakt
        if len(lobbies[lobby_id]['guesses']) == len(lobbies[lobby_id]['players']):
            results = calculate_results(lobbies[lobby_id])
            emit('results_ready', {'results': results}, room=lobby_id)

def calculate_results(lobby):
    shared_location = lobby['location']
    guesses = lobby['guesses']
    results = []

    for guess in guesses:
        guessed_coords = [float(coord) for coord in guess['guess'].split(',')]
        distance = calculate_distance(shared_location, guessed_coords)
        score = max(0, 10000 - int(distance * 100))  # Simpele scoreberekening
        results.append({
            'username': guess['username'],
            'guess': guess['guess'],
            'distance': round(distance, 2),
            'score': score
        })

    return sorted(results, key=lambda x: x['score'], reverse=True)

def calculate_distance(loc1, loc2):
    from geopy.distance import geodesic
    return geodesic((loc1['lat'], loc1['lng']), loc2).km
    
if __name__ == '__main__':
    app.run(debug=True )
    socketio.run(app, debug=True)