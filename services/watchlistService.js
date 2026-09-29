const pool = require('../db');

async function addToWatchlist(userId, asteroidId) {
    const result = await pool.query(
        "INSERT INTO watchlist (user_id, asteroid_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *",
        [userId, asteroidId]
    );
    return result.rows[0];
}

async function getWatchlist(userId){
    const result = await pool.query(
        `SELECT asteroids.* FROM asteroids
        JOIN watchlists ON watchlists.asteroid_id = asteroids.id
        WHERE watchlists.user_id = $1
        `,
        [userId]
    );
    return result.rows;
}

module.exports = {addToWatchlist, getWatchlist};