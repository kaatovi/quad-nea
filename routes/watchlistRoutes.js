const express = require("express");
const requireAuth = require('../middleware/requireAuth');
const watchlistController = require('../controllers/watchlistController');

const router = express.Router();

router.use(requireAuth);
router.post("/", watchlistController.addAsteroid);
router.get("/", watchlistController.listWatchlist);

module.exports = router;