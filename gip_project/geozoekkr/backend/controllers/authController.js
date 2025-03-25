const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");

exports.register = (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 10);
  db.query(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.status(201).send({ message: "Account aangemaakt!" });
    }
  );
};

exports.login = (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err || results.length === 0)
        return res.status(401).send("Gebruiker niet gevonden");

      const user = results[0];
      if (!bcrypt.compareSync(password, user.password))
        return res.status(401).send("Ongeldig wachtwoord");

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      res.send({ token });
    }
  );
};
