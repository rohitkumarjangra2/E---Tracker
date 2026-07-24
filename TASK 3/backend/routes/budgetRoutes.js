const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getBudgets,
  setBudget,
  deleteBudget
} = require('../controllers/budgetController');

// Apply auth middleware to all budget routes
router.use(auth);

router.route('/')
  .get(getBudgets)
  .post(setBudget);

router.route('/:id')
  .delete(deleteBudget);

module.exports = router;
