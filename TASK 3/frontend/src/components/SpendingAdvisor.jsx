import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  PiggyBank, 
  RefreshCw, 
  DollarSign, 
  CheckCircle2, 
  Info,
  ArrowRight
} from 'lucide-react';

const SpendingAdvisor = ({ currencySymbol }) => {
  const [advice, setAdvice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const token = localStorage.getItem('token');

  const API_BASE_URL = 'http://localhost:5001/api';

  useEffect(() => {
    fetchAdvice();
  }, []);

  const fetchAdvice = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/advisor/advice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAdvice(data.data);
      } else {
        setError(data.error || 'Failed to load spending advice');
      }
    } catch (err) {
      setError('Connection failed. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/advisor/advice/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAdvice(data.data);
      } else {
        setError(data.error || 'Failed to regenerate spending advice');
      }
    } catch (err) {
      setError('Connection failed while regenerating.');
    } finally {
      setRegenerating(false);
    }
  };

  // Card animation variants
  const cardContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardItemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          className="text-primary-glow"
          style={{ color: 'var(--color-primary)' }}
        >
          <RefreshCw size={48} className="animate-spin" />
        </motion.div>
        <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Analyzing transaction data...</p>
        <p className="text-sm mt-1 text-muted" style={{ color: 'var(--text-secondary)' }}>Gemini AI is examining your budget limits and spending trends.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel text-center py-10 flex flex-col items-center justify-center">
        <AlertTriangle size={48} style={{ color: 'var(--color-expense)' }} />
        <h3 className="text-xl font-bold mt-4" style={{ color: 'var(--text-primary)' }}>Oops! Something went wrong</h3>
        <p className="mt-2 text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button onClick={fetchAdvice} className="btn btn-primary mt-6">
          <RefreshCw size={16} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  const { summary, overspendingCategories, insights, recommendations, conciseAdvice } = advice;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header section with Sparkling AI branding */}
      <div className="dashboard-header flex justify-between items-center flex-wrap gap-4">
        <div className="welcome-section">
          <h1 className="flex items-center gap-2" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <Sparkles size={28} style={{ color: 'var(--color-purple)' }} />
            AI Spending Advisor
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Instant wealth recommendations powered by Google Gemini</p>
        </div>

        <button 
          onClick={handleRegenerate} 
          disabled={regenerating} 
          className="btn btn-primary flex items-center gap-2"
          style={{ 
            opacity: regenerating ? 0.7 : 1, 
            cursor: regenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} />
          {regenerating ? 'Consulting Gemini...' : 'Regenerate Insights'}
        </button>
      </div>

      {/* Concise Advice Hero Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel"
        style={{
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, var(--panel-bg), rgba(168, 85, 247, 0.05))',
          borderLeft: '4px solid var(--color-purple)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ 
            backgroundColor: 'var(--color-primary-glow)', 
            padding: '0.75rem', 
            borderRadius: '12px',
            color: 'var(--color-purple)' 
          }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>AI Executive Summary</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>{conciseAdvice}</p>
          </div>
        </div>
      </motion.div>

      {/* Sub Analytics: Overspending and MoM variance */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        
        {/* Overspending Panel */}
        <div className="glass-panel">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <AlertTriangle size={20} style={{ color: 'var(--color-expense)' }} />
            Budget Limit Alerts
          </h3>
          
          {overspendingCategories.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', color: 'var(--text-secondary)' }}>
              <CheckCircle2 size={32} style={{ color: 'var(--color-income)', marginBottom: '0.5rem' }} />
              <p style={{ fontWeight: '500' }}>All categories under budget!</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>You have stayed within all active budget limits.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
              {overspendingCategories.map((item, idx) => (
                <div key={idx} style={{ padding: '0.8rem', border: '1px solid var(--panel-border)', borderRadius: '12px', backgroundColor: 'rgba(255, 63, 94, 0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.category}</span>
                    <span style={{ color: 'var(--color-expense)', fontWeight: 'bold' }}>+{currencySymbol}{Math.round(item.excess)} over limit</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <span>Spent: {currencySymbol}{Math.round(item.spent)}</span>
                    <span>Limit: {currencySymbol}{Math.round(item.limit)}</span>
                  </div>
                  <div style={{ height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '100%', backgroundColor: 'var(--color-expense)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Current vs Last Month aggregates */}
        <div className="glass-panel flex flex-col justify-between">
          <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
            <TrendingUp size={20} style={{ color: 'var(--color-primary)' }} />
            Month-over-Month Summary
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This Month Spending</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-expense)', marginTop: '0.25rem' }}>{currencySymbol}{Math.round(summary.totalExpense)}</h2>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--panel-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>This Month Income</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-income)', marginTop: '0.25rem' }}>{currencySymbol}{Math.round(summary.totalIncome)}</h2>
            </div>
          </div>

          <div style={{ marginTop: '1rem', padding: '0.8rem 1rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--panel-border)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Info size={16} style={{ color: 'var(--color-primary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Net Balance: <strong style={{ color: summary.netBalance >= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
                {summary.netBalance >= 0 ? '+' : ''}{currencySymbol}{Math.round(summary.netBalance)}
              </strong>
            </span>
          </div>
        </div>

      </div>

      {/* Main double column: Insights & Saving Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem' }}>
        
        {/* Animated Insights list */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lightbulb size={22} style={{ color: 'var(--color-warning)' }} />
            Spending Insights
          </h3>
          <motion.div 
            variants={cardContainerVariants}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {insights.map((insight, idx) => (
              <motion.div 
                key={idx}
                variants={cardItemVariants}
                whileHover={{ scale: 1.01, translateX: 4 }}
                className="glass-panel"
                style={{ 
                  padding: '1rem', 
                  borderRadius: '16px',
                  borderLeft: '4px solid var(--color-warning)',
                  backgroundColor: 'rgba(245, 158, 11, 0.01)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ color: 'var(--color-warning)', marginTop: '0.15rem' }}>
                  <TrendingUp size={18} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{insight}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Animated Recommendations list */}
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PiggyBank size={22} style={{ color: 'var(--color-income)' }} />
            Saving Recommendations
          </h3>
          <motion.div 
            variants={cardContainerVariants}
            initial="hidden"
            animate="show"
            style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {recommendations.map((rec, idx) => (
              <motion.div 
                key={idx}
                variants={cardItemVariants}
                whileHover={{ scale: 1.01, translateX: 4 }}
                className="glass-panel"
                style={{ 
                  padding: '1rem', 
                  borderRadius: '16px',
                  borderLeft: '4px solid var(--color-income)',
                  backgroundColor: 'rgba(16, 185, 129, 0.01)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ color: 'var(--color-income)', marginTop: '0.15rem' }}>
                  <ArrowRight size={18} />
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: '1.5' }}>{rec}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
    </div>
  );
};

export default SpendingAdvisor;
