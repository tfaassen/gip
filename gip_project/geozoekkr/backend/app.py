from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import mysql.connector

load_dotenv()  # Laad de omgevingsvariabelen uit het .env-bestand

app = Flask(__name__, template_folder="../frontend", static_folder="../frontend/static")
CORS(app)  # Enable CORS
app.secret_key = "jouw_geheime_sleutel"  # Nodig voor sessies

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
def home():
    return render_template('index.html')

# ✅ Scoreboard
@app.route('/scoreboard')
def scoreboard():
    cursor.execute("SELECT username, score, time FROM scores ORDER BY score DESC LIMIT 10")
    scores = cursor.fetchall()
    return jsonify(scores)

# ✅ Registreren
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data['username']
    password = data['password']

    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()
    if user:
        return jsonify({"error": "Gebruiker bestaat al!"}), 400

    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, password))
    db.commit()
    return jsonify({"message": "Registratie succesvol!"})

# ✅ Inloggen
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    cursor.execute("SELECT * FROM users WHERE username = %s AND password = %s", (username, password))
    user = cursor.fetchone()
    
    if user:
        session['username'] = username
        return jsonify({"token": "fake-jwt-token"})  # Replace with real token generation
    else:
        return jsonify({"error": "Foute gebruikersnaam of wachtwoord!"}), 400

# ✅ Accountpagina
@app.route('/account')
def account():
    if 'username' not in session:
        return jsonify({"error": "Niet ingelogd!"}), 401

    username = session['username']
    cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
    user = cursor.fetchone()

    return jsonify(user)

# ✅ Uitloggen
@app.route('/logout')
def logout():
    session.pop('username', None)
    return jsonify({"message": "Uitgelogd!"})

@app.route('/locatie')
def locatie():
    api_key = os.getenv('GOOGLE_MAPS_API_KEY')
    return jsonify({"api_key": api_key})

# ✅ Resultaatpagina
@app.route('/resultaat')
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
def singleplayer():
    return render_template('singleplayer.html')

# ✅ Multiplayerpagina
@app.route('/multiplayer')
def multiplayer():
    return render_template('multiplayer.html')

if __name__ == '__main__':
    app.run(debug=True)