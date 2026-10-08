const express = require('express');
const neaController = require('../controllers/neaController'); // Import contoller functions
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

// Define routes for NEA data
router.get('/asteroids', neaController.listAsteroids);
router.post('/nea/sync', requireAuth, neaController.syncNeaData);

module.exports = router;