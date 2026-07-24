const mongoose = require('mongoose');

const FinancialDNASchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: String, // YYYY-MM
    required: true
  },
  personalityType: {
    type: String,
    required: true,
    enum: ['Strategic Saver', 'Impulse Buyer', 'Emotional Shopper', 'Weekend Spender', 'Budget Master']
  },
  financialScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  description: {
    type: String,
    required: true
  },
  strengths: [{
    type: String
  }],
  weaknesses: [{
    type: String
  }],
  analysisSource: {
    type: String,
    enum: ['gemini', 'local'],
    default: 'local'
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 70
  },
  metrics: {
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    savingsRate: { type: Number, default: 0 },
    budgetCompliance: { type: Number, default: 100 },
    weekendRatio: { type: Number, default: 0 },
    wantsRatio: { type: Number, default: 0 },
    totalTxCount: { type: Number, default: 0 },
    wantsTxCount: { type: Number, default: 0 }
  },
  traits: {
    rationality: { type: Number, required: true, default: 50 }, // Rational vs Emotional
    planning: { type: Number, required: true, default: 50 },    // Planned vs Impulsive
    discipline: { type: Number, required: true, default: 50 },  // Budget Adherence
    velocity: { type: Number, required: true, default: 50 }      // Weekday vs Weekend spending weight
  },
  evolution: [{
    month: { type: String, required: true },
    score: { type: Number, required: true },
    personalityType: { type: String, required: true }
  }]
}, {
  timestamps: true
});

// Index to ensure unique DNA profile per user per month
FinancialDNASchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('FinancialDNA', FinancialDNASchema);
