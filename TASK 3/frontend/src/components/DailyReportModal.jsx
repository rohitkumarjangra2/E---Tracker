import React, { useState, useEffect } from 'react';
import { X, FileText, Calendar, Download, Loader2, AlertCircle } from 'lucide-react';
import { generateDailyReportPDF } from '../utils/pdfGenerator';

const DailyReportModal = ({ isOpen, onClose, token, currencySymbol = '$', apiBaseUrl = 'http://localhost:5001/api' }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dayTransactions, setDayTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch transactions for the chosen date
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchDayTransactions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/transactions?date=${selectedDate}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        if (data.success) {
          setDayTransactions(data.data);
        } else {
          console.error('Failed to fetch transactions for date:', selectedDate);
        }
      } catch (error) {
        console.error('Error fetching transactions for daily report:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDayTransactions();
  }, [selectedDate, isOpen, apiBaseUrl]);

  if (!isOpen) return null;

  // Calculate quick summary metrics
  const summaryMetrics = dayTransactions.reduce(
    (acc, curr) => {
      if (curr.type === 'income') {
        acc.income += curr.amount;
      } else {
        acc.expenses += curr.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const netSavings = summaryMetrics.income - summaryMetrics.expenses;

  // Currency helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencySymbol === '₹' ? 'INR' : currencySymbol === '€' ? 'EUR' : 'USD',
      minimumFractionDigits: 2
    }).format(val).replace('USD', '$').replace('INR', '₹').replace('EUR', '€');
  };

  const handleDownload = () => {
    if (dayTransactions.length === 0) return;
    setIsGenerating(true);
    
    // Simulate minor delay for micro-animation feel
    setTimeout(() => {
      try {
        generateDailyReportPDF(selectedDate, dayTransactions, currencySymbol);
      } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Could not generate PDF report. Please try again.');
      } finally {
        setIsGenerating(false);
      }
    }, 600);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ 
              backgroundColor: 'var(--color-primary-glow)', 
              color: 'var(--color-primary)', 
              padding: '6px', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FileText size={18} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Daily Financial Report</h2>
          </div>
          <button className="action-icon-btn" onClick={onClose} style={{ borderRadius: '50%' }}>
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          {/* Date Picker Form Group */}
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Calendar size={14} /> Select Statement Date
            </label>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]} // Block future dates
              style={{ fontSize: '0.95rem' }}
            />
          </div>

          {/* Report Summary Live Preview Title */}
          <div style={{ borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '0.05em' }}>
              Report Preview & Summary
            </span>
          </div>

          {isLoading ? (
            <div style={{ padding: '3rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'var(--text-muted)' }}>
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: '0.85rem' }}>Analyzing ledger records...</span>
            </div>
          ) : (
            <>
              {/* live stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', margin: '0.5rem 0 1.25rem 0' }}>
                <div style={{ padding: '0.75rem 0.5rem', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.04)', border: '1px solid rgba(16, 185, 129, 0.12)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-income)', textTransform: 'uppercase' }}>Income</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-income)' }}>
                    {formatCurrency(summaryMetrics.income)}
                  </div>
                </div>

                <div style={{ padding: '0.75rem 0.5rem', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.12)', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-expense)', textTransform: 'uppercase' }}>Expenses</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '0.25rem', color: 'var(--color-expense)' }}>
                    {formatCurrency(summaryMetrics.expenses)}
                  </div>
                </div>

                <div style={{ 
                  padding: '0.75rem 0.5rem', 
                  borderRadius: '10px', 
                  background: netSavings >= 0 ? 'rgba(59, 130, 246, 0.04)' : 'rgba(239, 68, 68, 0.04)', 
                  border: netSavings >= 0 ? '1px solid rgba(59, 130, 246, 0.12)' : '1px solid rgba(239, 68, 68, 0.12)', 
                  textAlign: 'center' 
                }}>
                  <div style={{ 
                    fontSize: '0.7rem', 
                    fontWeight: 600, 
                    color: netSavings >= 0 ? 'var(--color-primary)' : 'var(--color-expense)', 
                    textTransform: 'uppercase' 
                  }}>
                    Net Balance
                  </div>
                  <div style={{ 
                    fontSize: '1.05rem', 
                    fontWeight: 700, 
                    marginTop: '0.25rem', 
                    color: netSavings >= 0 ? 'var(--text-primary)' : 'var(--color-expense)' 
                  }}>
                    {formatCurrency(netSavings)}
                  </div>
                </div>
              </div>

              {/* Transactions details Preview */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Logged Entries ({dayTransactions.length})
                </span>
                
                <div style={{ marginTop: '0.5rem' }}>
                  {dayTransactions.length > 0 ? (
                    <div 
                      style={{ 
                        maxHeight: '160px', 
                        overflowY: 'auto', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '0.5rem', 
                        paddingRight: '4px' 
                      }} 
                      className="custom-scrollbar"
                    >
                      {dayTransactions.map(item => (
                        <div 
                          key={item._id} 
                          style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center', 
                            background: 'rgba(255, 255, 255, 0.015)', 
                            border: '1px solid var(--panel-border)', 
                            padding: '0.6rem 0.8rem', 
                            borderRadius: '10px', 
                            fontSize: '0.8rem' 
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.title}</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.category}</span>
                          </div>
                          <span style={{ 
                            fontWeight: 700, 
                            color: item.type === 'income' ? 'var(--color-income)' : 'var(--color-expense)' 
                          }}>
                            {item.type === 'income' ? '+' : '-'}{formatCurrency(item.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ 
                      padding: '2rem 1.5rem', 
                      textAlign: 'center', 
                      background: 'rgba(255, 255, 255, 0.01)', 
                      border: '1px dashed var(--panel-border)', 
                      borderRadius: '12px', 
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}>
                      <AlertCircle size={24} style={{ color: 'var(--color-expense)', opacity: 0.8 }} />
                      <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>No Records Logged</h4>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '300px' }}>
                        There are no transactions recorded on this date. PDF generation is only available for days with logged items.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isGenerating}>
            Close
          </button>
          
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleDownload}
            disabled={dayTransactions.length === 0 || isLoading || isGenerating}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Exporting PDF...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Download Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyReportModal;
