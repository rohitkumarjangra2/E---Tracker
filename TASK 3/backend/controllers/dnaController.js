const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const FinancialDNA = require('../models/FinancialDNA');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const PERSONALITY_TYPES = [
  'Strategic Saver',
  'Impulse Buyer',
  'Emotional Shopper',
  'Weekend Spender',
  'Budget Master'
];

const WANTS_CATEGORIES = [
  'shopping',
  'entertainment',
  'dining',
  'dining out',
  'food & dining',
  'leisure',
  'gifts',
  'travel',
  'cafe',
  'other'
];

const clamp = (value, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(Number(value) || 0)));

const getMonthRange = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
};

const normalizeList = (items, fallback) => {
  const source = Array.isArray(items) && items.length ? items : fallback;
  return source
    .filter(Boolean)
    .map(item => String(item).trim())
    .filter(Boolean)
    .slice(0, 3);
};

const parseGeminiJson = (text) => {
  const cleanText = String(text || '').replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
  const firstBrace = cleanText.indexOf('{');
  const lastBrace = cleanText.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error('Gemini did not return a JSON object.');
  }

  return JSON.parse(cleanText.slice(firstBrace, lastBrace + 1));
};

const sanitizeAIResult = (candidate, fallback) => {
  if (!candidate || typeof candidate !== 'object') return null;

  return {
    personalityType: PERSONALITY_TYPES.includes(candidate.personalityType)
      ? candidate.personalityType
      : fallback.personalityType,
    financialScore: clamp(candidate.financialScore ?? fallback.financialScore),
    description: typeof candidate.description === 'string' && candidate.description.trim()
      ? candidate.description.trim()
      : fallback.description,
    strengths: normalizeList(candidate.strengths, fallback.strengths),
    weaknesses: normalizeList(candidate.weaknesses, fallback.weaknesses),
    traits: {
      rationality: clamp(candidate.traits?.rationality ?? fallback.traits.rationality),
      planning: clamp(candidate.traits?.planning ?? fallback.traits.planning),
      discipline: clamp(candidate.traits?.discipline ?? fallback.traits.discipline),
      velocity: clamp(candidate.traits?.velocity ?? fallback.traits.velocity)
    },
    confidence: clamp(candidate.confidence ?? fallback.confidence ?? 80, 55, 98)
  };
};

const getPersonalityCopy = (personalityType) => {
  const copy = {
    'Budget Master': {
      description: 'You show strong control over your cash flow. Your spending stays close to planned category limits, and your saving habits are supported by steady tracking rather than guesswork. This profile points to a user who uses budgets as a decision system, not just a report.',
      strengths: [
        'Strong budget adherence across categories',
        'Reliable saving discipline and positive cash-flow awareness',
        'Clear separation between planned needs and flexible wants'
      ],
      weaknesses: [
        'Can become overly restrictive if every purchase feels like a breach',
        'May postpone worthwhile upgrades or experiences too long',
        'Needs periodic review so old budgets do not become stale rules'
      ]
    },
    'Strategic Saver': {
      description: 'Your financial pattern is anchored in long-term security. You keep discretionary spending contained, protect your savings rate, and appear more likely to plan purchases than react to them. This is a wealth-building profile when paired with clear goals and regular investing.',
      strengths: [
        'Healthy savings rate and strong capital accumulation focus',
        'Low dependency on spontaneous discretionary spending',
        'Good delay of gratification for future milestones'
      ],
      weaknesses: [
        'May underspend on quality-of-life improvements',
        'Can hold too much idle cash without an investment plan',
        'Unexpected expenses may feel more stressful than they need to'
      ]
    },
    'Weekend Spender': {
      description: 'Your spending pattern is relatively concentrated around weekends. That often means weekday discipline is being offset by leisure, dining, travel, or social spending spikes. With a weekend envelope, this personality can keep the fun while reducing surprise month-end pressure.',
      strengths: [
        'Good weekday restraint when routines are stable',
        'Willingness to invest in rest, social life, and experiences',
        'Clear timing pattern that can be managed with weekly limits'
      ],
      weaknesses: [
        'Weekend rewards can erase weekday savings quickly',
        'Social or leisure plans may bypass category budgets',
        'Large two-day spending clusters make cash-flow forecasting harder'
      ]
    },
    'Impulse Buyer': {
      description: 'Your transaction pattern suggests fast purchase decisions and frequent discretionary activity. The risk is usually not one huge expense, but many small leaks that quietly reduce savings. Simple friction like wishlists, 24-hour waits, and category caps can make a big difference.',
      strengths: [
        'Fast decision-making and openness to trying useful products',
        'Flexible lifestyle spending that adapts quickly',
        'High awareness of convenience and immediate needs'
      ],
      weaknesses: [
        'Small frequent wants purchases can compound into large leaks',
        'Budget checks may happen after the purchase instead of before',
        'Emergency fund progress can become inconsistent'
      ]
    },
    'Emotional Shopper': {
      description: 'Your spending is strongly linked to comfort, recreation, or reward categories. This does not mean the spending is wrong, but it does mean mood-based purchases can compete with savings goals. Naming emotional triggers and pre-allocating guilt-free money will keep this profile healthier.',
      strengths: [
        'Strong investment in comfort, experiences, and personal reward',
        'Good instinct for what improves day-to-day satisfaction',
        'Willingness to spend on moments that feel meaningful'
      ],
      weaknesses: [
        'Spending may become a default response to stress or boredom',
        'Wants can crowd out fixed goals when tracking is delayed',
        'High-comfort categories need firmer monthly boundaries'
      ]
    }
  };

  return copy[personalityType] || copy['Strategic Saver'];
};

const analyzeLocalDNA = (monthStr, metrics) => {
  const {
    totalIncome,
    savingsRate,
    budgetCompliance,
    weekendRatio,
    wantsRatio,
    totalTxCount,
    wantsTxCount
  } = metrics;

  const traits = {
    rationality: clamp(Math.max(0, savingsRate) * 0.45 + (100 - wantsRatio) * 0.55, 10, 100),
    planning: clamp((100 - wantsRatio) * 0.7 + (100 - Math.min(100, totalTxCount * 2)) * 0.3, 10, 100),
    discipline: clamp(budgetCompliance * 0.7 + Math.max(0, savingsRate) * 0.3, 10, 100),
    velocity: clamp(100 - weekendRatio, 10, 100)
  };

  let personalityType = 'Strategic Saver';
  let financialScore = 60 + savingsRate * 0.2;

  if (budgetCompliance >= 95 && savingsRate >= 20) {
    personalityType = 'Budget Master';
    financialScore = 84 + savingsRate * 0.15 + traits.discipline * 0.05;
  } else if (savingsRate >= 30 && wantsRatio < 35) {
    personalityType = 'Strategic Saver';
    financialScore = 74 + savingsRate * 0.25;
  } else if (weekendRatio >= 45) {
    personalityType = 'Weekend Spender';
    financialScore = 52 + traits.discipline * 0.22 - Math.max(0, weekendRatio - 45) * 0.3;
  } else if (wantsRatio >= 50 && wantsTxCount >= 5) {
    personalityType = 'Impulse Buyer';
    financialScore = 40 + Math.max(0, savingsRate) * 0.2 + traits.planning * 0.1;
  } else if (wantsRatio >= 40 || totalTxCount > 15) {
    personalityType = 'Emotional Shopper';
    financialScore = 45 + Math.max(0, savingsRate) * 0.22 + traits.rationality * 0.08;
  }

  const copy = getPersonalityCopy(personalityType);
  const confidence = clamp(55 + Math.min(totalTxCount, 25) + (totalIncome > 0 ? 10 : 0) + (budgetCompliance < 100 ? 5 : 0), 55, 95);

  return {
    personalityType,
    financialScore: clamp(financialScore),
    description: copy.description,
    strengths: copy.strengths,
    weaknesses: copy.weaknesses,
    traits,
    confidence
  };
};

const aggregateMonthMetrics = async (userId, monthStr) => {
  const { start, end } = getMonthRange(monthStr);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const transactions = await Transaction.find({
    user: userObjectId,
    date: { $gte: start, $lte: end }
  }).sort({ date: -1 });

  let totalIncome = 0;
  let totalExpense = 0;
  let totalTxCount = 0;
  let wantsTxCount = 0;
  let wantsExpense = 0;
  let weekendExpense = 0;

  transactions.forEach(transaction => {
    if (transaction.type === 'income') {
      totalIncome += transaction.amount;
      return;
    }

    if (transaction.type !== 'expense') return;

    totalExpense += transaction.amount;
    totalTxCount += 1;

    const categoryLower = String(transaction.category || '').toLowerCase();
    const isWant = WANTS_CATEGORIES.some(category => categoryLower.includes(category));

    if (isWant) {
      wantsTxCount += 1;
      wantsExpense += transaction.amount;
    }

    const day = new Date(transaction.date).getDay();
    if (day === 0 || day === 6) {
      weekendExpense += transaction.amount;
    }
  });

  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0;
  const weekendRatio = totalExpense > 0 ? Math.round((weekendExpense / totalExpense) * 100) : 0;
  const wantsRatio = totalExpense > 0 ? Math.round((wantsExpense / totalExpense) * 100) : 0;

  const budgets = await Budget.find({ user: userObjectId });
  let budgetCompliance = 100;

  if (budgets.length > 0) {
    const categoryExpenses = {};

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        categoryExpenses[transaction.category] = (categoryExpenses[transaction.category] || 0) + transaction.amount;
      }
    });

    const exceededCount = budgets.filter(budget => (categoryExpenses[budget.category] || 0) > budget.limit).length;
    budgetCompliance = Math.round(((budgets.length - exceededCount) / budgets.length) * 100);
  }

  return {
    totalIncome,
    totalExpense,
    savingsRate,
    budgetCompliance,
    weekendRatio,
    wantsRatio,
    totalTxCount,
    wantsTxCount,
    transactionsSample: transactions.slice(0, 20).map(transaction => ({
      title: transaction.title,
      amount: transaction.amount,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date
    }))
  };
};

const buildEvolution = async (userId, monthStr, currentAnalysis, currentMetrics) => {
  const evolution = [];
  const currentMonthDate = new Date(`${monthStr}-01T00:00:00.000Z`);

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(currentMonthDate.getUTCFullYear(), currentMonthDate.getUTCMonth() - i, 1));
    const pastMonthStr = date.toISOString().substring(0, 7);

    if (pastMonthStr === monthStr) continue;

    const cachedDNA = await FinancialDNA.findOne({ user: userId, month: pastMonthStr });
    if (cachedDNA) {
      evolution.push({
        month: pastMonthStr,
        score: cachedDNA.financialScore,
        personalityType: cachedDNA.personalityType
      });
      continue;
    }

    const pastMetrics = await aggregateMonthMetrics(userId, pastMonthStr);
    if (pastMetrics.totalTxCount > 0 || pastMetrics.totalIncome > 0) {
      const pastAnalysis = analyzeLocalDNA(pastMonthStr, pastMetrics);
      evolution.push({
        month: pastMonthStr,
        score: pastAnalysis.financialScore,
        personalityType: pastAnalysis.personalityType
      });
      continue;
    }

    const inferredScore = clamp(currentAnalysis.financialScore - i * 3, 35, 95);
    let inferredType = 'Impulse Buyer';
    if (inferredScore > 80) inferredType = 'Budget Master';
    else if (inferredScore > 70) inferredType = 'Strategic Saver';
    else if (inferredScore > 55) inferredType = 'Weekend Spender';
    else if (inferredScore > 45) inferredType = 'Emotional Shopper';

    evolution.push({
      month: pastMonthStr,
      score: inferredScore,
      personalityType: currentMetrics.totalTxCount > 0 ? inferredType : currentAnalysis.personalityType
    });
  }

  return evolution;
};

const generateGeminiDNA = async (monthStr, metrics, localResult) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
You are an expert personal finance behavioral psychologist and advisor. Analyze this user's spending data for ${monthStr}.

Metrics Summary:
- Income: INR ${metrics.totalIncome}
- Total Expenses: INR ${metrics.totalExpense}
- Monthly Savings Rate: ${metrics.savingsRate}%
- Budget Adherence Score: ${metrics.budgetCompliance}%
- Weekend Spending Share: ${metrics.weekendRatio}% of expenses occurred on Saturday/Sunday
- Wants Spending Share: ${metrics.wantsRatio}% of expenses went to discretionary wants
- Expense Transactions: ${metrics.totalTxCount}; Wants Transactions: ${metrics.wantsTxCount}

Sample Transactions:
${JSON.stringify(metrics.transactionsSample, null, 2)}

Classify the user into exactly one dominant Financial Personality:
1. Strategic Saver: High savings rate over 30%, prioritizes saving/investing, low spontaneous wants spending.
2. Impulse Buyer: Many small-to-medium wants/shopping transactions, low planning, frequent budget friction.
3. Emotional Shopper: High comfort/recreation/retail therapy spend, high wants ratio, emotionally driven purchases.
4. Weekend Spender: More than 40% of expenses occur on Saturday/Sunday.
5. Budget Master: 90-100% budget compliance, highly disciplined cash flow, clear category control.

Return a valid JSON object matching this TypeScript shape:
{
  "personalityType": "Strategic Saver" | "Impulse Buyer" | "Emotional Shopper" | "Weekend Spender" | "Budget Master",
  "financialScore": number,
  "description": "A customized 3-4 sentence paragraph. Be empathetic, specific, and professional.",
  "strengths": string[],
  "weaknesses": string[],
  "traits": {
    "rationality": number,
    "planning": number,
    "discipline": number,
    "velocity": number
  },
  "confidence": number
}

Rules:
- Scores must be integers from 0 to 100.
- strengths and weaknesses must contain exactly 3 concise items each.
- Return raw JSON only. Do not include markdown fences.
- Use INR as the currency context.
`;

  const ai = new GoogleGenerativeAI(apiKey);
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const response = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }]
  });

  return sanitizeAIResult(parseGeminiJson(response.response.text()), localResult);
};

async function generateAndSaveDNA(userId, monthStr) {
  const metrics = await aggregateMonthMetrics(userId, monthStr);
  const localResult = analyzeLocalDNA(monthStr, metrics);
  let dnaResult = null;
  let analysisSource = 'local';

  try {
    dnaResult = await generateGeminiDNA(monthStr, metrics, localResult);
    if (dnaResult) analysisSource = 'gemini';
  } catch (apiError) {
    console.error('Gemini DNA analysis failed, using local classifier:', apiError.message);
  }

  const finalResult = dnaResult || localResult;
  const evolution = await buildEvolution(userId, monthStr, finalResult, metrics);

  evolution.push({
    month: monthStr,
    score: finalResult.financialScore,
    personalityType: finalResult.personalityType
  });

  return FinancialDNA.findOneAndUpdate(
    { user: userId, month: monthStr },
    {
      user: userId,
      month: monthStr,
      personalityType: finalResult.personalityType,
      financialScore: finalResult.financialScore,
      description: finalResult.description,
      strengths: finalResult.strengths,
      weaknesses: finalResult.weaknesses,
      analysisSource,
      confidence: finalResult.confidence,
      metrics: {
        totalIncome: metrics.totalIncome,
        totalExpense: metrics.totalExpense,
        savingsRate: metrics.savingsRate,
        budgetCompliance: metrics.budgetCompliance,
        weekendRatio: metrics.weekendRatio,
        wantsRatio: metrics.wantsRatio,
        totalTxCount: metrics.totalTxCount,
        wantsTxCount: metrics.wantsTxCount
      },
      traits: finalResult.traits,
      evolution
    },
    { upsert: true, new: true, runValidators: true }
  );
}

exports.getFinancialDNA = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    const cachedDNA = await FinancialDNA.findOne({ user: userId, month: currentMonthStr });
    if (cachedDNA) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: cachedDNA
      });
    }

    const dna = await generateAndSaveDNA(userId, currentMonthStr);
    return res.status(200).json({
      success: true,
      cached: false,
      data: dna
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Financial DNA Error: ${error.message}`
    });
  }
};

exports.regenerateFinancialDNA = async (req, res) => {
  try {
    const userId = req.user.id;
    const currentMonthStr = new Date().toISOString().substring(0, 7);

    await FinancialDNA.deleteOne({ user: userId, month: currentMonthStr });

    const dna = await generateAndSaveDNA(userId, currentMonthStr);
    return res.status(200).json({
      success: true,
      data: dna
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: `Financial DNA regeneration failed: ${error.message}`
    });
  }
};
