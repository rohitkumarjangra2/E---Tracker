const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats
} = require('../controllers/transactionController');

// Apply auth middleware to all transaction routes
router.use(auth);

router.route('/')
  .get(getTransactions)
  .post(addTransaction);

router.route('/stats')
  .get(getTransactionStats);

router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
