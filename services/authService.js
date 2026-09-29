const bcrypt = require('bcrypt');
const pool = require('../db');
const jwt = require('jsonwebtoken');

async function loginUser(email, password) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = result.rows[0];

    if(!user) {
        throw new Error("Invalid Credentials!");
    }

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if(!passwordMatches) {
        throw new Error("Invalid Credentials!");
    }

    const token = jwt.sign(
        {userId: user.id, email: user.email},
        process.env.JWT_SECRET,
        {expiresIn: "7d"}
    );

    return token;
}

async function registerUser(email, password) {
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
        "INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at",
        [email, passwordHash]
    );

    return result.rows[0];
}

module.exports = {registerUser, loginUser};