const mongoose = require('mongoose');

const AdviceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String, // YYYY-MM
    required: true
  },
  summary: {
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    netBalance: { type: Number, default: 0 },
    totalBudgets: { type: Number, default: 0 },
    budgetLimit: { type: Number, default: 0 }
  },
  overspendingCategories: [{
    category: { type: String, required: true },
    spent: { type: Number, required: true },
    limit: { type: Number, required: true },
    excess: { type: Number, required: true },
    percentage: { type: Number, default: 0 }
  }],
  insights: [{
    type: String
  }],
  recommendations: [{
    type: String
  }],
  conciseAdvice: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Compound index so each user can have only one cached advice per month
AdviceSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Advice', AdviceSchema);
