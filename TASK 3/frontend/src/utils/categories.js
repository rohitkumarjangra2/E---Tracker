export const CATEGORIES = {
  // Expense Categories
  Food: { color: '#f59e0b', type: 'expense' },
  Shopping: { color: '#ec4899', type: 'expense' },
  'Rent & Bills': { color: '#3b82f6', type: 'expense' },
  Entertainment: { color: '#8b5cf6', type: 'expense' },
  Transport: { color: '#06b6d4', type: 'expense' },
  
  // Income Categories
  Salary: { color: '#10b981', type: 'income' },
  Freelance: { color: '#14b8a6', type: 'income' },
  
  // Neutral/Mixed Categories
  Investment: { color: '#6366f1', type: 'mixed' },
  Others: { color: '#6b7280', type: 'mixed' }
};

export const getCategoryColor = (category) => {
  return CATEGORIES[category]?.color || '#6b7280';
};
