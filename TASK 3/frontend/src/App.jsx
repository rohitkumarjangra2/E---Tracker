import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  Sliders, 
  Sun, 
  Moon, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Plus,
  Coins,
  LogOut,
  Sparkles,
  Dna,
  FileText
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import BudgetSettings from './components/BudgetSettings';
import SpendingAdvisor from './components/SpendingAdvisor';
import FinancialDNA from './components/FinancialDNA';
import Login from './components/Login';
import Signup from './components/Signup';
import { useAuth } from './context/AuthContext';
import DailyReportModal from './components/DailyReportModal';

const API_BASE_URL = 'http://localhost:5001/api';

const App = () => {
  const { user, token, loading, logout } = useAuth();
  
  // Navigation & View States
  const [activeView, setActiveView] = useState('dashboard');
  const [authView, setAuthView] = useState('login');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [currency, setCurrency] = useState(localStorage.getItem('currency') || '$');
  
  // Data States
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [stats, setStats] = useState({
    summary: { totalIncome: 0, totalExpense: 0, netBalance: 0 },
    categoriesBreakdown: [],
    categoryChartData: [],
    dailyTrends: []
  });
  
  // Form Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  
  // Filters State for Transaction History
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    category: 'all',
    sortBy: 'date-desc'
  });

  // App initialization & theme sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Fetch Stats and Budgets on active view change
  useEffect(() => {
    if (token) {
      fetchStats();
      fetchBudgets();
    }
  }, [activeView, token]);

  // Fetch Transactions when filters change or view changes to transactions list
  useEffect(() => {
    if (token) {
      fetchTransactions();
    }
  }, [filters, activeView, token]);

  // Core API Integrations
  const fetchTransactions = async () => {
    try {
      const { search, type, category, sortBy } = filters;
      
      // Parse sorting details
      let sortByField = 'date';
      let sortOrder = 'desc';
      if (sortBy === 'date-asc') {
        sortByField = 'date';
        sortOrder = 'asc';
      } else if (sortBy === 'amount-desc') {
        sortByField = 'amount';
        sortOrder = 'desc';
      } else if (sortBy === 'amount-asc') {
        sortByField = 'amount';
        sortOrder = 'asc';
      }

      const queryParams = new URLSearchParams({
        search,
        type,
        category,
        sortBy: sortByField,
        order: sortOrder
      });

      const response = await fetch(`${API_BASE_URL}/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setTransactions(data.data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const fetchBudgets = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setBudgets(data.data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  // Transaction CRUD triggers
  const handleAddTransaction = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setIsFormOpen(false);
        fetchStats();
        fetchTransactions();
      } else {
        alert('Failed to add transaction: ' + (data.error || 'Server error'));
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleUpdateTransaction = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${editingTransaction._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        setIsFormOpen(false);
        setEditingTransaction(null);
        fetchStats();
        fetchTransactions();
      } else {
        alert('Failed to update transaction: ' + (data.error || 'Server error'));
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction record?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchStats();
        fetchTransactions();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Budget triggers
  const handleSetBudget = async (budgetData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/budgets`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(budgetData)
      });
      const data = await response.json();
      if (data.success) {
        fetchBudgets();
        fetchStats();
      } else {
        alert('Failed to set budget: ' + (data.error || 'Server error'));
      }
    } catch (error) {
      console.error('Error setting budget:', error);
    }
  };

  const handleDeleteBudget = async (id) => {
    if (!window.confirm('Are you sure you want to remove this budget limit?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        fetchBudgets();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  // Theme toggle helper
  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Modal Open for Edit
  const handleEditClick = (transaction) => {
    setEditingTransaction(transaction);
    setIsFormOpen(true);
  };

  // Modal Open for Add
  const handleAddClick = () => {
    setEditingTransaction(null);
    setIsFormOpen(true);
  };

  // Render correct main component based on navigation state
  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <Dashboard 
            stats={stats} 
            onAddTransactionClick={handleAddClick}
            onOpenReportClick={() => setIsReportModalOpen(true)}
            currencySymbol={currency}
          />
        );
      case 'transactions':
        return (
          <TransactionList 
            transactions={transactions}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteTransaction}
            filters={filters}
            onFilterChange={setFilters}
            currencySymbol={currency}
          />
        );
      case 'budgets':
        return (
          <BudgetSettings 
            budgets={budgets}
            stats={stats}
            onSetBudget={handleSetBudget}
            onDeleteBudget={handleDeleteBudget}
            currencySymbol={currency}
          />
        );
      case 'advisor':
        return (
          <SpendingAdvisor 
            currencySymbol={currency}
          />
        );
      case 'dna':
        return (
          <FinancialDNA 
            currencySymbol={currency}
          />
        );
      default:
        return <div>View not found</div>;
    }
  };

  // Auth Loading State
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <div className="spinner" style={{ width: '50px', height: '50px', borderWidth: '4px', borderTopColor: 'var(--color-primary)' }}></div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1.5rem', fontWeight: '500', fontFamily: 'Outfit, sans-serif' }}>Securing Connection...</p>
      </div>
    );
  }

  // Logged Out Screen
  if (!user) {
    if (authView === 'signup') {
      return <Signup onToggleView={setAuthView} />;
    }
    return <Login onToggleView={setAuthView} />;
  }

  // Logged In Application Screen
  return (
    <div className="app-container">
      {/* Sidebar navigation */}
      <aside className="sidebar">
        <div className="logo-container" style={{ marginBottom: '1.5rem' }}>
          <div className="logo-icon">
            <Coins size={22} />
          </div>
          <span className="logo-text">Expense Tracker</span>
        </div>

        {/* User profile card */}
        <div className="sidebar-profile" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem', padding: '0.5rem 0.8rem', borderRadius: '12px', border: '1px solid var(--panel-border)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-purple))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#fff', fontSize: '0.95rem' }}>
            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.username}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{user.email}</span>
          </div>
        </div>

        <nav className="nav-menu">
          <li 
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </li>
          
          <li 
            className={`nav-item ${activeView === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveView('transactions')}
          >
            <Receipt size={18} />
            <span>History</span>
          </li>

          <li 
            className={`nav-item ${activeView === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveView('budgets')}
          >
            <Sliders size={18} />
            <span>Budgets</span>
          </li>

          <li 
            className={`nav-item ${activeView === 'dna' ? 'active' : ''}`}
            onClick={() => setActiveView('dna')}
          >
            <Dna size={18} style={{ color: 'var(--color-primary)' }} />
            <span>Financial DNA</span>
          </li>

          <li 
            className={`nav-item ${activeView === 'advisor' ? 'active' : ''}`}
            onClick={() => setActiveView('advisor')}
          >
            <Sparkles size={18} style={{ color: 'var(--color-purple)' }} />
            <span>AI Advisor</span>
          </li>

          <li 
            className="nav-item"
            style={{ 
              marginTop: '1.25rem', 
              border: '1px dashed var(--panel-border)', 
              borderRadius: '10px', 
              background: 'rgba(99, 102, 241, 0.04)',
              color: 'var(--color-primary)'
            }}
            onClick={() => setIsReportModalOpen(true)}
          >
            <FileText size={18} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontWeight: 600 }}>Daily Report</span>
          </li>
        </nav>

        {/* Currency Preference panel */}
        <div style={{ margin: '1rem 0', padding: '0.8rem 1rem', border: '1px solid var(--panel-border)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Currency Preference</span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem' }}>
            {['$', '₹', '€'].map(symbol => (
              <button 
                key={symbol}
                style={{ 
                  padding: '4px',
                  borderRadius: '6px',
                  border: currency === symbol ? '1px solid var(--color-primary)' : '1px solid transparent',
                  background: currency === symbol ? 'var(--color-primary-glow)' : 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
                onClick={() => setCurrency(symbol)}
              >
                {symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Theme Toggle Button */}
        <button className="theme-toggle-btn" onClick={toggleTheme} style={{ marginBottom: '0.5rem' }}>
          {theme === 'dark' ? (
            <>
              <Sun size={18} />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={18} />
              <span>Dark Mode</span>
            </>
          )}
        </button>

        {/* Logout Button */}
        <button 
          className="logout-btn" 
          onClick={logout} 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            border: '1px solid rgba(244, 63, 94, 0.2)',
            background: 'transparent',
            color: 'var(--color-expense)',
            cursor: 'pointer',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            width: '100%'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-expense-glow)';
            e.currentTarget.style.borderColor = 'var(--color-expense)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.2)';
          }}
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main content pane */}
      <main className="main-content">
        {renderActiveView()}
      </main>

      {/* Adding/Editing Transaction Modal Dialog */}
      <TransactionForm 
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
        initialData={editingTransaction}
      />

      {/* Daily Expense Report PDF Modal Dialog */}
      <DailyReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        currencySymbol={currency}
        apiBaseUrl={API_BASE_URL}
        token={token}
      />
    </div>
  );
};

export default App;
