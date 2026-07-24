const mongoose = require('mongoose');

const BudgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  limit: {
    type: Number,
    required: [true, 'Please specify a monthly budget limit'],
    min: [0, 'Budget limit must be 0 or greater']
  }
}, {
  timestamps: true
});

// Add compound unique index so each user can only have one budget per category
BudgetSchema.index({ user: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', BudgetSchema);
