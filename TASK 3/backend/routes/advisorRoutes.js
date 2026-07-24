const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getAdvisorAdvice, regenerateAdvice } = require('../controllers/advisorController');

// Apply auth middleware to protect all advisor routes
router.use(auth);

// GET /api/advisor/advice -> fetches or generates current month insights
router.get('/advice', getAdvisorAdvice);

// POST /api/advisor/advice/regenerate -> deletes cache and forces regeneration
router.post('/advice/regenerate', regenerateAdvice);

module.exports = router;
