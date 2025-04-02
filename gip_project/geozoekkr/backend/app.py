from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import mysql.connector
from flask_cors import cross_origin

load_dotenv()  # Laad de omgevingsvariabelen uit het .env-bestand

app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3000"}})
app.secret_key = "jouw_geheime_sleutel"  # Zorg ervoor dat dit een veilige sleutel is
app.config['SESSION_TYPE'] = 'filesystem'  # Gebruik bestandssysteem voor sessies

# Verbinding maken met MySQL
db = mysql.connector.connect(
    host="localhost",
    user="root",  # Verander dit naar jouw MySQL-gebruiker
    password="",  # Verander dit naar jouw MySQL-wachtwoord
    database="geozoekkr"
)

cursor = db.cursor(dictionary=True)  # Data als dictionary ophalen

# ✅ Homepagina
@app.route('/')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def home():
    return render_template('index.html')

# ✅ Scoreboard
@app.route('/scoreboard')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def scoreboard():
    cursor.execute("SELECT username, score, time FROM scores ORDER BY score DESC LIMIT 10")
    scores = cursor.fetchall()
    return jsonify(scores)

# ✅ Registreren
@app.route('/register', methods=['POST'])
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def register():
    data = request.json
    username = data['username']
    password = data['password']

    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if user:
        return jsonify({"error": "Gebruiker bestaat al!"}), 400

    cursor.execute("INSERT INTO users (username, password_hash) VALUES (%s, %s)", (username, password))
    db.commit()
    return jsonify({"message": "Registratie succesvol!"})

# ✅ Inloggen
@app.route('/login', methods=['POST'])
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def login():
    data = request.json
    print(f"Ontvangen data: {data}")  # Debugging
    username = data['username']
    password = data['password']

    cursor.execute("SELECT * FROM users WHERE username = %s AND password_hash = %s", (username, password))
    user = cursor.fetchone()
    
    if user:
        session['username'] = username
        print(f"Gebruiker {username} is ingelogd.")  # Debugging
        return jsonify({"token": "fake-jwt-token"})
    else:
        print("Foute gebruikersnaam of wachtwoord!")  # Debugging
        return jsonify({"error": "Foute gebruikersnaam of wachtwoord!"}), 400
@app.route('/account')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def account():
    if 'username' not in session:
        return jsonify({"error": "Niet ingelogd!"}), 401

    username = session['username']
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    return jsonify(user)

# ✅ Uitloggen
@app.route('/logout')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def logout():
    session.pop('username', None)
    return jsonify({"message": "Uitgelogd!"})

@app.route('/locatie')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def locatie():
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    return jsonify({"api_key": api_key})

# ✅ Resultaatpagina
@app.route('/resultaat')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
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

# ✅ Singleplayerpagina
@app.route('/singleplayer')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def singleplayer():
    return render_template('singleplayer.html')

# ✅ Multiplayerpagina
@app.route('/multiplayer')
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def multiplayer():
    return render_template('multiplayer.html')
@app.route('/test-session')
def test_session():
    if 'username' in session:
        print(f"Sessie gevonden: {session}")  # Debugging
        return jsonify({"username": session['username']})
    print("Geen sessie gevonden.")  # Debugging
    return jsonify({"error": "Geen gebruiker ingelogd!"}), 401
@app.route('/save-game', methods=['POST'])
@cross_origin(origin='http://localhost:3000', headers=['Content-Type'])
def save_game():
    if 'username' not in session:
        return jsonify({"error": "Niet ingelogd!"}), 401

    data = request.json
    username = session['username']
    score = data['score']

    # Haal de user_id op
    cursor.execute("SELECT id FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if not user:
        return jsonify({"error": "Gebruiker niet gevonden!"}), 404

    user_id = user['id']
    print(f"User ID: {user_id}")  # Debugging

    # Controleer of er al een record in de scores-tabel bestaat voor deze gebruiker
    cursor.execute("SELECT * FROM scores WHERE user_id = %s", (user_id,))
    existing_score = cursor.fetchone()
    print(f"Existing Score: {existing_score}")  # Debugging

    if existing_score:
        # Update het bestaande record
        new_games_played = existing_score['games_played'] + 1
        new_total_score = existing_score['total_score'] + score
        new_best_score = max(existing_score['best_score'], score)

        cursor.execute("""
            UPDATE scores
            SET games_played = %s, total_score = %s, best_score = %s
            WHERE user_id = %s
        """, (new_games_played, new_total_score, new_best_score, user_id))
        print("Score bijgewerkt!")  # Debugging
    else:
        # Maak een nieuw record aan
        cursor.execute("""
            INSERT INTO scores (user_id, games_played, total_score, best_score)
            VALUES (%s, %s, %s, %s)
        """, (user_id, 1, score, score))
        print("Nieuw score record aangemaakt!")  # Debugging

    db.commit()
    return jsonify({"message": "Game succesvol opgeslagen!"})
if __name__ == '__main__':
    app.run(debug=True )