const pool = require('../db');

async function addToWatchlist(userId, neoId) {
    const result = await pool.query(
        `INSERT INTO watchlists (user_id, neo_id) 
        VALUES ($1, $2) 
        ON CONFLICT (user_id, neo_id) 
        DO NOTHING 
        RETURNING *`,
        [userId, neoId]
    );
    return result.rows[0];
}

async function getWatchlist(userId){
    const result = await pool.query(
        `SELECT DISTINCT ON (a.neo_id) a.* 
        FROM watchlists w
        JOIN asteroids a ON a.neo_id = w.neo_id
        WHERE w.user_id = $1
        ORDER BY a.neo_id, a.close_approach_date DESC
        `,
        [userId]
    );
    return result.rows;
}

module.exports = {addToWatchlist, getWatchlist};