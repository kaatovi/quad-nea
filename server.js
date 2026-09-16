require("dotenv").config();

const pool = require("./db");
const express = require('express');

const app = express();

// Function to transform raw NEO data into a readable format
function transformNeoData(rawData) {
    const entries = Object.entries(rawData.near_earth_objects); // Turns object entries into an array of [date, asteroids] pairs

    // Flattens the group of arrays (date, asteroidsOnDat) into a single array of asteroids
    const asteroids = entries.flatMap(([date, asteroidsOnDate]) => {
        return asteroidsOnDate.map((asteroid) => {
            // Get relevant asteroid data
            const diameterKm = asteroid.estimated_diameter.kilometers.estimated_diameter_max;
            const missDistanceKm = asteroid.close_approach_data[0].miss_distance.kilometers;
            
            return {
                // Asteroid identification
                neoId: asteroid.neo_reference_id,
                name: asteroid.name,
                date: date,
                diameterKm: Number(diameterKm.toFixed(3)),
                missDistanceKm: Number(Number(missDistanceKm).toFixed(0)),
                hazardous: asteroid.is_potentially_hazardous_asteroid,
            };
        });
    });

    return asteroids;
}

// Function to save asteroid data into database
async function saveAsteroids(asteroids) {
    const query = `
    INSERT INTO asteroids (neo_id, name, close_approach_date, diameter_km, miss_distance_km, hazardous)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (neo_id, close_approach_date) DO UPDATE SET
        diameter_km = EXCLUDED.diameter_km,
        miss_distance_km = EXCLUDED.miss_distance_km,
        hazardous = EXCLUDED.hazardous
    `;

    let savedCount = 0;
    // Goes through each iteration until query is complete, then increments the savedCount variable
    for (const asteroid of asteroids) {
        await pool.query(query, [
            asteroid.neoId,
            asteroid.name,
            asteroid.date,
            asteroid.diameterKm,
            asteroid.missDistanceKm,
            asteroid.hazardous,
        ]);
        savedCount++;
    }

    return savedCount;
}

// Routes for the API

// Fetches data from NASA API
app.get("/api/neo/feed", async (req, res) => {
    const apiKey = process.env.NASA_API_KEY;
    const startDate = req.query.start_date || "2026-09-15";
    const endDate = req.query.end_date || "2026-09-16";

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const asteroids = transformNeoData(data);
        
        res.json(asteroids);
    } catch (error) {
        console.error("Failed to fetch from NASA API:", error.message);
        res.status(500).json({ error: "Could not fetch data from NASA API" })
    }
});

// Synchronize data with the database
app.post("/api/neo/sync", async (req, res) => {
    const apiKey = process.env.NASA_API_KEY;
    const startDate = "2026-09-15";
    const endDate = "2026-09-16";

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

    // Fetches data from NASA API, transforms it, and saves it to the database
    try {
        const response = await fetch(url);
        const data = await response.json();
        const asteroids = transformNeoData(data);
        const saveCount = await saveAsteroids(asteroids);

        res.json({ message: "Sync completed", saved: saveCount });
    } catch (error) {
        console.error("Sync failed:", error.message);
        res.status(500).json({ error: "Sync failed" });
    }
});

// API connection to postgres database to fetch asteroid data
app.get("/api/asteroids", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM asteroids ORDER BY miss_distance_km ASC"); // Ascending order
        res.json(result.rows);
    } catch (error) {
        console.error("Failed to fetch from database", error.message);
        res.status(500).json({ error: "Could not fetch asteroids from database" });
    }
})

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});