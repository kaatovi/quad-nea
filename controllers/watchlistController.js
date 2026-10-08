const watchlistService = require('../services/watchlistService');

async function addAsteroid(req, res) {
    try {
        const entry = await watchlistService.addToWatchlist(req.userId, req.body.asteroidId);
        res.status(201).json(entry);
    } catch(error) {
        console.error("Failed to add watchlist:", error.message);
        res.status(500).json({error: "Could not add to watchlist"});
    }
}

async function listWatchlist(req, res) {
    try{
        const watchlist = await watchlistService.getWatchlist(req.userId);
        res.json(watchlist);
    } catch(error) {
        console.error("Failed to load watchlist:", error.message);
        res.status(500).json({error: "Could not fetch watchlist"});
    }
}

module.exports = {addAsteroid, listWatchlist};