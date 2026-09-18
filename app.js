require("dotenv").config();
const express = require('express');
const neaRoutes = require('./routes/neaRoutes');
const cors = require('cors');

const app = express();

// Middleware to parse JSON requests
app.use(cors());
app.use("/api", neaRoutes);


module.exports = app;