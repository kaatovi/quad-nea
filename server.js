require("dotenv").config();

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

// Routes for the API
app.get("/api/neo/feed", async (req, res) => {

    // Fetch NEO data from NASA API
    const apiKey = process.env.NASA_API_KEY;
    const startDate = "2026-09-08";
    const endDate = "2026-09-09";

    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const asteroids = transformNeoData(data);
        res.json(asteroids);
    } catch (error) {
        console.error("Failed to fetch NEO data", error.message);
        res.status(500).json({ error: "Could not fetch NEO data" });
    }
});

app.get('/about', (req, res) => {
    res.send("About Page");
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});