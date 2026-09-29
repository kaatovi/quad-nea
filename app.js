require("dotenv").config();
const express = require('express');
const neaRoutes = require('./routes/neaRoutes');
const cors = require('cors');

const app = express();
const authRoutes = require('./routes/authRoutes');

// Middleware to parse JSON requests
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);


module.exports = app;