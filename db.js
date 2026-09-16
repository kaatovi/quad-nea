const { Pool } = require('pg');

// Create a new pool instance using the connection string from env variables
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

module.exports = pool;