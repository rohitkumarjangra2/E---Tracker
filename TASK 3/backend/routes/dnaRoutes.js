const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getFinancialDNA, regenerateFinancialDNA } = require('../controllers/dnaController');

// Apply auth middleware to protect all Financial DNA routes
router.use(auth);

// GET /api/dna -> fetches or generates current month's Financial DNA profile
router.get('/', getFinancialDNA);

// POST /api/dna/regenerate -> forces recalculation and overwrites cached DNA
router.post('/regenerate', regenerateFinancialDNA);

module.exports = router;
