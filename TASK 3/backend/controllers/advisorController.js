const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Advice = require('../models/Advice');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Helper to get start and end dates for a given month offset
// offset 0 = current month, offset -1 = previous month
const getMonthBounds = (offset = 0) => {
  const start = new Date();
  start.setMonth(start.getMonth() + offset);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Local analysis helper to serve as fallback
const generateLocalAdvice = (currentSummary, MoMDiffs, overspending) => {
  const insights = [];
  const recommendations = [];

  // MoM Diffs logic
  MoMDiffs.forEach(diff => {
    if (diff.pctChange > 15) {
      insights.push(`Your ${diff.category} spending increased significantly by ${Math.round(diff.pctChange)}% (₹${Math.round(diff.diff)} more than last month).`);
      recommendations.push(`Try to limit non-essential purchases in ${diff.category} to save around ₹${Math.round(diff.diff * 0.5)} next month.`);
    } else if (diff.pctChange < -15) {
      insights.push(`Great job! You reduced your ${diff.category} expenses by ${Math.abs(Math.round(diff.pctChange))}% compared to last month.`);
    }
  });

  // Overspending logic
  overspending.forEach(item => {
    insights.push(`You have exceeded your ${item.category} budget limit of ₹${item.limit} by ₹${Math.round(item.excess)} (${Math.round(item.percentage)}% used).`);
    recommendations.push(`Consider pausing high-cost activities in ${item.category} or setting up transactional alerts.`);
  });

  // General fallback insights/recs if list is too short
  if (insights.length === 0) {
    insights.push("Your spending this month is stable and matches your previous month's patterns.");
  }
  if (recommendations.length === 0) {
    recommendations.push("Continue tracking your transactions daily to maintain your budget discipline.");
    recommendations.push("Consider investing your net balance surplus into a secure fixed deposit or mutual fund.");
  }

  // Create descriptive concise advice
  let conciseAdvice = '';
  if (currentSummary.totalExpense > currentSummary.totalIncome) {
    conciseAdvice = `Alert: Your expenses (₹${Math.round(currentSummary.totalExpense)}) exceed your income (₹${Math.round(currentSummary.totalIncome)}) this month. We recommend cutting down on luxury/discretionary categories immediately to bring your budget back into positive balance.`;
  } else {
    const savingsRate = currentSummary.totalIncome > 0 ? Math.round(((currentSummary.totalIncome - currentSummary.totalExpense) / currentSummary.totalIncome) * 100) : 0;
    conciseAdvice = `Looking good! You've saved ₹${Math.round(currentSummary.totalIncome - currentSummary.totalExpense)} (${savingsRate}% of your income) this month. Maintain this disciplined cashflow by keeping tabs on category budget limits!`;
  }

  return { insights, recommendations, conciseAdvice };
};

// @desc    Get AI advisor insights
// @route   GET /api/advisor/advice
// @access  Private
exports.getAdvisorAdvice = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonthStr = new Date().toISOString().substring(0, 7); // YYYY-MM

    // Check cache first
    const cachedAdvice = await Advice.findOne({ user: userId, month: currentMonthStr });
    if (cachedAdvice) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedAdvice
      });
    }

    // Call generation function
    const advice = await generateAndSaveAdvice(userId, currentMonthStr);
    res.status(200).json({
      success: true,
      cached: false,
      data: advice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Advisor error: ' + error.message
    });
  }
};

// @desc    Force regenerate advisor insights
// @route   POST /api/advisor/advice/regenerate
// @access  Private
exports.regenerateAdvice = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    // Delete existing cache
    await Advice.deleteOne({ user: userId, month: currentMonthStr });

    const advice = await generateAndSaveAdvice(userId, currentMonthStr);
    res.status(200).json({
      success: true,
      data: advice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Advisor regeneration failed: ' + error.message
    });
  }
};

// Core analysis and AI generation orchestrator
async function generateAndSaveAdvice(userId, monthStr) {
  // 1. Gather date boundaries
  const current = getMonthBounds(0);
  const previous = getMonthBounds(-1);

  // 2. Fetch income/expense stats for current month
  const currentStats = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: current.start, $lte: current.end }
      }
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' }
      }
    }
  ]);

  let totalIncome = 0;
  let totalExpense = 0;
  currentStats.forEach(stat => {
    if (stat._id === 'income') totalIncome = stat.total;
    if (stat._id === 'expense') totalExpense = stat.total;
  });

  const netBalance = totalIncome - totalExpense;

  // 3. Fetch category breakdown for CURRENT month
  const currentCategoryStats = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: current.start, $lte: current.end }
      }
    },
    {
      $group: {
        _id: '$category',
        totalSpent: { $sum: '$amount' }
      }
    }
  ]);

  // 4. Fetch category breakdown for PREVIOUS month
  const previousCategoryStats = await Transaction.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        type: 'expense',
        date: { $gte: previous.start, $lte: previous.end }
      }
    },
    {
      $group: {
        _id: '$category',
        totalSpent: { $sum: '$amount' }
      }
    }
  ]);

  // Map previous category data for easy MoM lookup
  const prevMap = {};
  previousCategoryStats.forEach(item => {
    prevMap[item._id] = item.totalSpent;
  });

  // Calculate MoM variances
  const MoMDiffs = [];
  currentCategoryStats.forEach(curr => {
    const category = curr._id;
    const currentSpent = curr.totalSpent;
    const prevSpent = prevMap[category] || 0;

    if (prevSpent > 0) {
      const diff = currentSpent - prevSpent;
      const pctChange = (diff / prevSpent) * 100;
      MoMDiffs.push({ category, currentSpent, prevSpent, diff, pctChange });
    } else {
      // First time spending on this category compared to last month
      MoMDiffs.push({ category, currentSpent, prevSpent: 0, diff: currentSpent, pctChange: 100 });
    }
  });

  // 5. Gather budgets and determine overspending
  const budgets = await Budget.find({ user: userId });
  const budgetMap = {};
  let totalLimit = 0;
  budgets.forEach(b => {
    budgetMap[b.category] = b.limit;
    totalLimit += b.limit;
  });

  const overspendingCategories = [];
  currentCategoryStats.forEach(curr => {
    const category = curr._id;
    const spent = curr.totalSpent;
    const limit = budgetMap[category] || 0;

    if (limit > 0 && spent > limit) {
      overspendingCategories.push({
        category,
        spent,
        limit,
        excess: spent - limit,
        percentage: Math.round((spent / limit) * 100)
      });
    }
  });

  // Compile final transaction summary payload to pass to Gemini
  const summaryPayload = {
    currentSummary: {
      totalIncome,
      totalExpense,
      netBalance,
      totalBudgets: budgets.length,
      budgetLimit: totalLimit
    },
    categorySpending: currentCategoryStats.map(item => ({
      category: item._id,
      spent: item.totalSpent,
      limit: budgetMap[item._id] || 0
    })),
    MoMDiffs,
    overspendingCategories
  };

  // 6. Integrate Gemini API
  let apiInsights = null;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      // Setup prompt
      const prompt = `
You are a brilliant personal finance advisor. Analyze the following user transaction summaries, budget limits, and month-over-month (MoM) variances:

Summary Details:
- Current Month Income: ₹${totalIncome}
- Current Month Expenses: ₹${totalExpense}
- Net Balance: ₹${netBalance}
- Budget Limits Set: ₹${totalLimit} (across ${budgets.length} categories)

Category Spending (Current Month vs Budget Limits):
${JSON.stringify(summaryPayload.categorySpending, null, 2)}

Month-over-Month Spending Differences:
${JSON.stringify(MoMDiffs, null, 2)}

Overspending Categories:
${JSON.stringify(overspendingCategories, null, 2)}

Generate highly actionable, customized financial insights.
Strictly return a valid JSON object matching the following TypeScript interface structure:
interface AdvisorResponse {
  insights: string[]; // 3-4 specific observations about their spending behavior, e.g. "You spent 20% more on food this month."
  recommendations: string[]; // 3-4 actionable tips to save money, e.g. "You can save ₹3000 by reducing cab expenses."
  conciseAdvice: string; // A 2-3 sentence paragraph summarizing their financial health and next steps.
}

Do not include markdown tags like \`\`\`json or \`\`\`. Return only the raw JSON. Use Indian Rupees (₹) as the default currency context.
`;

      const ai = new GoogleGenerativeAI(apiKey);
      const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
      const response = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      const textResponse = response.response.text().trim();
      
      // Clean up text response in case JSON blocks are present
      const cleanJson = textResponse.replace(/^```json/, '').replace(/```$/, '').trim();
      apiInsights = JSON.parse(cleanJson);
    } catch (apiError) {
      console.error('Gemini API Error, falling back to local analyzer:', apiError.message);
    }
  } else {
    console.log('No GEMINI_API_KEY found in environment. Using local analyzer.');
  }

  // Fallback if API was unsuccessful or key is missing
  if (!apiInsights || !apiInsights.insights) {
    apiInsights = generateLocalAdvice(summaryPayload.currentSummary, MoMDiffs, overspendingCategories);
  }

  // 7. Save advice in MongoDB
  const cachedAdvice = await Advice.findOneAndUpdate(
    { user: userId, month: monthStr },
    {
      user: userId,
      month: monthStr,
      summary: summaryPayload.currentSummary,
      overspendingCategories,
      insights: apiInsights.insights,
      recommendations: apiInsights.recommendations,
      conciseAdvice: apiInsights.conciseAdvice
    },
    { upsert: true, new: true }
  );

  return cachedAdvice;
}
