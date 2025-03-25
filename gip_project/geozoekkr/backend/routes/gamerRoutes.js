const express = require("express");
const { submitScore, getLeaderboard } = require("./controllers/gameController");
const router = express.Router();

router.post("/submit-score", submitScore);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
