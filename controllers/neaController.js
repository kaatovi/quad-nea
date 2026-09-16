const neaService = require('../services/neaService'); // Import service function

// Controller function to handle syncing NEA data
async function syncNeaData(req, res) {
    try {
        const startDate = "2026-09-15";
        const endDate = "2026-09-16";
        
        const asteroids = await neaService.fetchFromNASA(startDate, endDate);
        const savedCount = await neaService.saveAsteroids(asteroids);
        
        res.json({ message: "Sync completed", saved: savedCount });
    } catch (error) {
        console.error("Sync failed:", error.message);
        res.status(500).json({ error: "Sync failed" });
    }
}

// Controller function to list all asteroids from database
async function listAsteroids(req, res) {
    try {
        const asteroids = await neaService.getAllAsteroid();
        res.json(asteroids);
    } catch (error) {
        console.error("Failed to fetch from database:", error.message);
        res.status(500).json({ error: "Could not fetch asteroids" });
    }
}

module.exports = {
    listAsteroids,
    syncNeaData,
};