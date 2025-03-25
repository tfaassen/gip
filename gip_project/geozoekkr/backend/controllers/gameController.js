const db = require("../db");

exports.submitScore = (req, res) => {
  const { userId, score } = req.body;
  db.query(
    "INSERT INTO scores (user_id, score) VALUES (?, ?)",
    [userId, score],
    (err, result) => {
      if (err) return res.status(500).send(err);
      res.send({ message: "Score opgeslagen!" });
    }
  );
};

exports.getLeaderboard = (req, res) => {
  db.query("SELECT * FROM scores ORDER BY score DESC LIMIT 10", (err, results) => {
    if (err) return res.status(500).send(err);
    res.send(results);
  });
};
