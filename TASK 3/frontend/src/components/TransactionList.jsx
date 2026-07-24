import React, { useState } from 'react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  Inbox,
  ShoppingBag,
  Utensils,
  Home,
  Film,
  Car,
  CircleDollarSign,
  Briefcase,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { getCategoryColor } from '../utils/categories';

// Category icons map helper
export const getCategoryIcon = (category, size = 18) => {
  switch (category) {
    case 'Food':
      return <Utensils size={size} />;
    case 'Shopping':
      return <ShoppingBag size={size} />;
    case 'Rent & Bills':
      return <Home size={size} />;
    case 'Entertainment':
      return <Film size={size} />;
    case 'Transport':
      return <Car size={size} />;
    case 'Salary':
      return <CircleDollarSign size={size} />;
    case 'Freelance':
      return <Briefcase size={size} />;
    case 'Investment':
      return <TrendingUp size={size} />;
    default:
      return <HelpCircle size={size} />;
  }
};

const TransactionList = ({ 
  transactions = [], 
  onEditClick, 
  onDeleteClick, 
  filters, 
  onFilterChange,
  currencySymbol = '$'
}) => {
  
  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencySymbol === '₹' ? 'INR' : currencySymbol === '€' ? 'EUR' : 'USD',
      minimumFractionDigits: 2
    }).format(val).replace('USD', '$').replace('INR', '₹').replace('EUR', '€');
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onFilterChange({
      ...filters,
      [name]: value
    });
  };

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '1.5rem' }}>
        <div className="welcome-section">
          <h1>Transaction History</h1>
          <p>View, manage, and filter all logged cash items.</p>
        </div>
      </div>

      {/* Filters row */}
      <div className="glass-panel filters-row" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon-inside" />
          <input 
            type="text" 
            name="search"
            placeholder="Search transactions..." 
            className="form-control search-control"
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>

        <select 
          name="type" 
          className="form-control filter-select"
          value={filters.type}
          onChange={handleInputChange}
        >
          <option value="all">All Types</option>
          <option value="income">Incomes</option>
          <option value="expense">Expenses</option>
        </select>

        <select 
          name="category" 
          className="form-control filter-select"
          value={filters.category}
          onChange={handleInputChange}
        >
          <option value="all">All Categories</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Rent & Bills">Rent & Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Transport">Transport</option>
          <option value="Salary">Salary</option>
          <option value="Freelance">Freelance</option>
          <option value="Investment">Investment</option>
          <option value="Others">Others</option>
        </select>

        <select 
          name="sortBy" 
          className="form-control filter-select"
          value={filters.sortBy}
          onChange={handleInputChange}
        >
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option>
          <option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {/* Transactions list */}
      <div className="transaction-list-container">
        {transactions.length > 0 ? (
          transactions.map(item => (
            <div key={item._id} className="transaction-item">
              <div className="trans-left">
                <div 
                  className="trans-category-icon" 
                  style={{ 
                    '--category-color': getCategoryColor(item.category),
                    backgroundColor: `${getCategoryColor(item.category)}15` 
                  }}
                >
                  {getCategoryIcon(item.category, 20)}
                </div>
                <div className="trans-details">
                  <span className="trans-title">{item.title}</span>
                  <div className="trans-meta">
                    <span style={{ color: getCategoryColor(item.category), fontWeight: 500 }}>
                      {item.category}
                    </span>
                    <div className="meta-dot" />
                    <span>{formatDate(item.date)}</span>
                    {item.description && (
                      <>
                        <div className="meta-dot" />
                        <span style={{ fontStyle: 'italic', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.description}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="trans-right">
                <span className={`trans-amount ${item.type}`}>
                  {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                </span>
                
                <div className="trans-actions">
                  <button 
                    className="action-icon-btn" 
                    onClick={() => onEditClick(item)}
                    title="Edit Transaction"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    className="action-icon-btn delete-btn" 
                    onClick={() => onDeleteClick(item._id)}
                    title="Delete Transaction"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel empty-state">
            <div className="empty-state-icon">
              <Inbox size={40} />
            </div>
            <h3>No Transactions Found</h3>
            <p>We couldn't find any financial records matching your filters or search keywords. Add some items or clear filters!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;
