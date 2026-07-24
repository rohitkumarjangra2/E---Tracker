const Budget = require('../models/Budget');

// @desc    Get all budgets
// @route   GET /api/budgets
// @access  Private
exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id });
    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Set or update a budget limit for a category
// @route   POST /api/budgets
// @access  Private
exports.setBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a category'
      });
    }

    if (limit === undefined || limit < 0) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a positive budget limit'
      });
    }

    // Upsert budget: find by category and user, if exists update limit, if not create new
    const budget = await Budget.findOneAndUpdate(
      { category: category.trim(), user: req.user.id },
      { limit, user: req.user.id },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: budget
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Delete a budget limit
// @route   DELETE /api/budgets/:id
// @access  Private
exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) {
      return res.status(404).json({
        success: false,
        error: 'No budget found for this ID'
      });
    }

    // Make sure user owns budget
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to delete this budget'
      });
    }

    await budget.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};
