import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const CATEGORY_OPTIONS = {
  income: ['Salary', 'Freelance', 'Investment', 'Others'],
  expense: ['Food', 'Shopping', 'Rent & Bills', 'Entertainment', 'Transport', 'Investment', 'Others']
};

const TransactionForm = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [errors, setErrors] = useState({});

  // Reset form or populate for edit
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || 'Food',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: initialData.description || ''
      });
      setErrors({});
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      setErrors({});
    }
  }, [initialData, isOpen]);

  // Adjust category if type change causes category to be invalid
  const handleTypeChange = (e) => {
    const newType = e.target.value;
    const defaultCat = newType === 'income' ? 'Salary' : 'Food';
    setFormData(prev => ({
      ...prev,
      type: newType,
      category: defaultCat
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.title.trim()) tempErrors.title = 'Title is required';
    if (!formData.amount) {
      tempErrors.amount = 'Amount is required';
    } else if (parseFloat(formData.amount) <= 0) {
      tempErrors.amount = 'Amount must be greater than 0';
    }
    if (!formData.date) tempErrors.date = 'Date is required';
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  if (!isOpen) return null;

  const isEditing = !!initialData;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {isEditing ? 'Edit Transaction' : 'Add New Transaction'}
          </h2>
          <button className="action-icon-btn" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleFormSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title</label>
              <input 
                type="text" 
                name="title"
                className="form-control"
                placeholder="e.g. Weekly Grocery Run"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
              {errors.title && <span style={{ color: 'var(--color-expense)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.title}</span>}
            </div>

            {/* Type & Amount row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select 
                  name="type" 
                  className="form-control"
                  value={formData.type}
                  onChange={handleTypeChange}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Amount</label>
                <input 
                  type="number" 
                  name="amount"
                  step="0.01"
                  min="0.01"
                  className="form-control"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
                {errors.amount && <span style={{ color: 'var(--color-expense)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.amount}</span>}
              </div>
            </div>

            {/* Category & Date row */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select 
                  name="category" 
                  className="form-control"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {CATEGORY_OPTIONS[formData.type].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                {errors.date && <span style={{ color: 'var(--color-expense)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.date}</span>}
              </div>
            </div>

            {/* Description */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description (Optional)</label>
              <textarea 
                name="description"
                rows="3"
                className="form-control"
                placeholder="Add notes about this transaction..."
                value={formData.description}
                onChange={handleInputChange}
                style={{ resize: 'none' }}
              />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {isEditing ? 'Save Changes' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
