require("dotenv").config();
const express = require('express');
const neaRoutes = require('./routes/neaRoutes');

const app = express();

// Middleware to parse JSON requests
app.use("/api", neaRoutes);

module.exports = app;