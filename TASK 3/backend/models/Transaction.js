const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive amount'],
    min: [0.01, 'Amount must be greater than 0']
  },
  type: {
    type: String,
    required: [true, 'Please specify type (income or expense)'],
    enum: ['income', 'expense']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Please add a date'],
    default: Date.now
  },
  description: {
    type: String,
    trim: true,
    maxlength: [250, 'Description cannot be more than 250 characters']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);
