import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertTriangle, 
  Plus, 
  Calendar,
  Sparkles,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { getCategoryColor } from '../utils/categories';

const Dashboard = ({ stats, onAddTransactionClick, onOpenReportClick, currencySymbol = '$' }) => {
  const { summary = {}, categoriesBreakdown = [], categoryChartData = [], dailyTrends = [] } = stats || {};
  
  const totalIncome = summary.totalIncome || 0;
  const totalExpense = summary.totalExpense || 0;
  const netBalance = summary.netBalance || 0;

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencySymbol === '₹' ? 'INR' : currencySymbol === '€' ? 'EUR' : 'USD',
      minimumFractionDigits: 2
    }).format(val).replace('USD', '$').replace('INR', '₹').replace('EUR', '€');
  };

  // Find categories exceeding or near budget (>80%)
  const budgetAlerts = categoriesBreakdown.filter(c => c.limit > 0 && c.spent >= c.limit * 0.8);

  // Custom Pie Chart tooltip
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel" style={{ padding: '0.5rem 1rem', border: '1px solid var(--panel-border)', borderRadius: '12px' }}>
          <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>{payload[0].name}</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-expense)', fontWeight: 700 }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Upper header */}
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Financial Dashboard</h1>
          <p>Real-time analytics and tracking of your daily cash flows.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onOpenReportClick}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--panel-border)' }}
          >
            <FileText size={16} /> Daily Report
          </button>
          <button className="btn btn-primary" onClick={onAddTransactionClick}>
            <Plus size={18} /> Add Transaction
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-row">
        <div className="glass-panel stat-card" style={{ '--glow-color': 'var(--color-primary)', '--stat-color': 'var(--color-primary)' }}>
          <div className="stat-icon">
            <Wallet size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Net Balance</span>
            <span className="stat-value" style={{ color: netBalance >= 0 ? 'var(--text-primary)' : 'var(--color-expense)' }}>
              {formatCurrency(netBalance)}
            </span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--glow-color': 'var(--color-income)', '--stat-color': 'var(--color-income)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-income-glow)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Income</span>
            <span className="stat-value" style={{ color: 'var(--color-income)' }}>
              {formatCurrency(totalIncome)}
            </span>
          </div>
        </div>

        <div className="glass-panel stat-card" style={{ '--glow-color': 'var(--color-expense)', '--stat-color': 'var(--color-expense)' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-expense-glow)' }}>
            <TrendingDown size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Expenses</span>
            <span className="stat-value" style={{ color: 'var(--color-expense)' }}>
              {formatCurrency(totalExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Alerts section */}
      {budgetAlerts.length > 0 && (
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-warning)', padding: '1.25rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-warning)', fontWeight: 600 }}>
            <AlertTriangle size={20} />
            <span>Budget Warnings & Limits</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '0.25rem' }}>
            {budgetAlerts.map(alert => (
              <div key={alert.category} style={{ fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(245, 158, 11, 0.05)', padding: '0.6rem 0.85rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{alert.category}: </span>
                  <span style={{ color: alert.isOverBudget ? 'var(--color-expense)' : 'var(--text-primary)' }}>
                    {formatCurrency(alert.spent)}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}> of {formatCurrency(alert.limit)}</span>
                </div>
                <span style={{ 
                  fontWeight: 700, 
                  color: alert.isOverBudget ? 'var(--color-expense)' : 'var(--color-warning)',
                  backgroundColor: alert.isOverBudget ? 'var(--color-expense-glow)' : 'rgba(245, 158, 11, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.8rem'
                }}>
                  {alert.percentageUsed}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Visualizations Grid */}
      <div className="viz-grid">
        {/* Trend Area Chart */}
        <div className="glass-panel" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <div className="chart-title">
            <span>Cash Flow History (Past 30 Days)</span>
            <Calendar size={16} style={{ color: 'var(--text-muted)' }} />
          </div>
          <div style={{ flexGrow: 1, width: '100%', height: '300px' }}>
            {dailyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-income)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-income)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-expense)" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="var(--color-expense)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--panel-border)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="var(--text-muted)" 
                    fontSize={11} 
                    tickLine={false}
                    tickFormatter={(tick) => {
                      const date = new Date(tick);
                      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    }}
                  />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'var(--bg-secondary)', 
                      borderColor: 'var(--panel-border)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'Outfit'
                    }}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" name="Income" dataKey="income" stroke="var(--color-income)" strokeWidth={2} fillOpacity={1} fill="url(#colorInc)" />
                  <Area type="monotone" name="Expense" dataKey="expense" stroke="var(--color-expense)" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                No transaction history to plot yet. Log some income or expenses!
              </div>
            )}
          </div>
        </div>

        {/* Category breakdown Chart */}
        <div className="glass-panel" style={{ minHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <div className="chart-title">
            <span>Expenses by Category</span>
          </div>
          <div style={{ flexGrow: 1, width: '100%', height: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {categoryChartData.length > 0 ? (
              <>
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={categoryChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={getCategoryColor(entry.name)} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom Category Legend */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem 1rem', justifyContent: 'center', marginTop: '1rem' }}>
                  {categoryChartData.map((entry, index) => (
                    <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', fontWeight: 500 }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getCategoryColor(entry.name) }} />
                      <span>{entry.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>({formatCurrency(entry.value)})</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', gap: '0.5rem', textAlign: 'center', padding: '1rem' }}>
                <Sparkles size={28} style={{ opacity: 0.5, marginBottom: '0.25rem' }} />
                <p style={{ fontSize: '0.9rem' }}>No expense records available yet.</p>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Add an expense to view category allocations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
