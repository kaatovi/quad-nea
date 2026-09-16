const pool = require('../db');

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

async function fetchFromNASA(startDate, endDate) {
    const apiKey = process.env.NASA_API_KEY;
    const url = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();
    return transformNeoData(data); 
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

// Function to retrieve all asteroid data from database
async function getAllAsteroid() {
    const result = await pool.query("SELECT * FROM asteroids")
    return result.rows;
}

module.exports = {
    fetchFromNASA,
    saveAsteroids,
    getAllAsteroid,
};