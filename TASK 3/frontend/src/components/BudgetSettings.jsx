import React, { useState } from 'react';
import { 
  Sliders, 
  Trash2, 
  AlertCircle, 
  CheckCircle,
  Plus
} from 'lucide-react';
import { getCategoryColor } from '../utils/categories';

const EXPENSE_CATEGORIES = ['Food', 'Shopping', 'Rent & Bills', 'Entertainment', 'Transport', 'Others'];

const BudgetSettings = ({ budgets = [], stats = {}, onSetBudget, onDeleteBudget, currencySymbol = '$' }) => {
  const [formData, setFormData] = useState({
    category: 'Food',
    limit: ''
  });

  const { categoriesBreakdown = [] } = stats || {};

  // Map breakdown stats to quickly access spent amounts
  const spentMap = {};
  categoriesBreakdown.forEach(item => {
    spentMap[item.category] = item.spent;
  });

  // Handle inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.limit || parseFloat(formData.limit) < 0) return;
    
    onSetBudget({
      category: formData.category,
      limit: parseFloat(formData.limit)
    });
    
    setFormData(prev => ({ ...prev, limit: '' }));
  };

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencySymbol === '₹' ? 'INR' : currencySymbol === '€' ? 'EUR' : 'USD',
      minimumFractionDigits: 2
    }).format(val).replace('USD', '$').replace('INR', '₹').replace('EUR', '€');
  };

  // Determine progress bar color based on percentage
  const getProgressBarColor = (percentage) => {
    if (percentage >= 100) return 'var(--color-expense)';
    if (percentage >= 75) return 'var(--color-warning)';
    return 'var(--color-income)';
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div className="welcome-section">
          <h1>Budget Settings</h1>
          <p>Control your expenses by setting custom monthly limits on key categories.</p>
        </div>
      </div>

      {/* Grid */}
      <div className="viz-grid">
        {/* Set Budget Form Panel */}
        <div className="glass-panel" style={{ height: 'fit-content' }}>
          <div className="chart-title">
            <span>Set Category Budget</span>
            <Sliders size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
          
          <form onSubmit={handleFormSubmit}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select 
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleInputChange}
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Monthly Limit ({currencySymbol})</label>
              <input 
                type="number"
                name="limit"
                min="0"
                step="1"
                placeholder="e.g. 500"
                className="form-control"
                value={formData.limit}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              <Plus size={18} /> Save Limit
            </button>
          </form>
        </div>

        {/* Budgets Tracker List Panel */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="chart-title">
            <span>Active Budget Limits</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flexGrow: 1 }}>
            {budgets.length > 0 ? (
              budgets.map(b => {
                const spent = spentMap[b.category] || 0;
                const percentage = b.limit > 0 ? Math.round((spent / b.limit) * 100) : 0;
                const isOver = spent > b.limit;
                
                return (
                  <div key={b._id} className="budget-progress-container">
                    <div className="budget-progress-header">
                      <div>
                        <span style={{ fontWeight: 600, color: getCategoryColor(b.category) }}>{b.category}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                          Spent {formatCurrency(spent)} of {formatCurrency(b.limit)}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontWeight: 700, 
                          color: getProgressBarColor(percentage),
                          fontSize: '0.85rem'
                        }}>
                          {percentage}%
                        </span>
                        
                        <button 
                          className="action-icon-btn delete-btn" 
                          onClick={() => onDeleteBudget(b._id)}
                          style={{ padding: '0.2rem' }}
                          title="Remove budget limit"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="budget-progress-track">
                      <div 
                        className="budget-progress-bar"
                        style={{ 
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: getProgressBarColor(percentage),
                          boxShadow: `0 0 10px ${getProgressBarColor(percentage)}40`
                        }}
                      />
                    </div>

                    {/* Quick status message */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', marginTop: '0.15rem' }}>
                      {isOver ? (
                        <>
                          <AlertCircle size={12} style={{ color: 'var(--color-expense)' }} />
                          <span style={{ color: 'var(--color-expense)', fontWeight: 500 }}>Over budget by {formatCurrency(spent - b.limit)}!</span>
                        </>
                      ) : percentage >= 80 ? (
                        <>
                          <AlertCircle size={12} style={{ color: 'var(--color-warning)' }} />
                          <span style={{ color: 'var(--color-warning)', fontWeight: 500 }}>Warning: Nearing budget limit.</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={12} style={{ color: 'var(--color-income)' }} />
                          <span style={{ color: 'var(--text-secondary)' }}>Budget status safe.</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', gap: '0.5rem' }}>
                <Sliders size={32} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 600 }}>No Budgets Configured</h3>
                <p style={{ fontSize: '0.85rem', maxWidth: '240px' }}>Specify monthly limits on categories like Food or Shopping to keep your savings on track!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetSettings;
