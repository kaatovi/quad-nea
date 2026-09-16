const express = require('express');
const neaController = require('../controllers/neaController'); // Import contoller functions

const router = express.Router();

// Define routes for NEA data
router.get('/asteroids', neaController.listAsteroids);
router.post('/nea/sync', neaController.syncNeaData);

module.exports = router;