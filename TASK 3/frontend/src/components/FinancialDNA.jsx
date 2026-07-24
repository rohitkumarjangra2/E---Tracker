import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dna,
  RefreshCw,
  PiggyBank,
  Shield,
  Calendar,
  AlertTriangle,
  Heart,
  CheckCircle,
  Sparkles,
  Zap,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
} from 'recharts';

const FinancialDNA = ({ currencySymbol = '$' }) => {
  const [dnaData, setDnaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const token = localStorage.getItem('token');

  const API_BASE_URL = 'http://localhost:5001/api';

  const fetchDNA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/dna`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDnaData(data.data);
      } else {
        setError(data.error || 'Failed to load your Financial DNA profile.');
      }
    } catch {
      setError('Connection failed. Please verify that the backend server is running.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDNA();
  }, [fetchDNA]);

  const handleRegenerate = async () => {
    setRegenerating(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/dna/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setDnaData(data.data);
      } else {
        setError(data.error || 'Failed to analyze your financial behavioral data.');
      }
    } catch {
      setError('Connection failed while analyzing behavioral data.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { repeat: Infinity, duration: 2, ease: 'linear' },
            scale: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' }
          }}
          style={{ color: 'var(--color-primary)', display: 'inline-block', marginBottom: '1.5rem' }}
        >
          <Dna size={54} />
        </motion.div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Sequencing Your Financial DNA...</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem', maxWidth: '380px' }}>
          Gemini AI is examining your transaction intervals, weekend velocity, and budget limits to map your behavioral traits.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: '500px', margin: '2rem auto' }}>
        <AlertTriangle size={48} style={{ color: 'var(--color-expense)', marginBottom: '1rem' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Failed to Sequence DNA</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={fetchDNA} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} /> Re-Attempt Sequencing
        </button>
      </div>
    );
  }

  const { personalityType, financialScore, description, strengths, weaknesses, traits, evolution, metrics, confidence, analysisSource } = dnaData;

  // Custom styling, icons, and gradients for each of the 5 personalities
  const getPersonalityDesign = (type) => {
    switch (type) {
      case 'Strategic Saver':
        return {
          icon: <PiggyBank size={32} />,
          badgeColor: 'var(--color-income)',
          gradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.05) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          glowColor: 'rgba(16, 185, 129, 0.4)',
          textColor: 'var(--color-income)',
          bgIcon: 'rgba(16, 185, 129, 0.1)',
          archetype: 'The Capital Accumulator'
        };
      case 'Budget Master':
        return {
          icon: <Shield size={32} />,
          badgeColor: 'var(--color-cyan)',
          gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.05) 100%)',
          borderColor: 'rgba(6, 182, 212, 0.25)',
          glowColor: 'rgba(6, 182, 212, 0.4)',
          textColor: 'var(--color-cyan)',
          bgIcon: 'rgba(6, 182, 212, 0.1)',
          archetype: 'The System Architect'
        };
      case 'Weekend Spender':
        return {
          icon: <Calendar size={32} />,
          badgeColor: 'var(--color-primary)',
          gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.05) 100%)',
          borderColor: 'rgba(99, 102, 241, 0.25)',
          glowColor: 'rgba(99, 102, 241, 0.4)',
          textColor: 'var(--color-primary)',
          bgIcon: 'rgba(99, 102, 241, 0.1)',
          archetype: 'The Dual-Mode Operator'
        };
      case 'Impulse Buyer':
        return {
          icon: <Zap size={32} />,
          badgeColor: 'var(--color-warning)',
          gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(244, 63, 94, 0.05) 100%)',
          borderColor: 'rgba(245, 158, 11, 0.25)',
          glowColor: 'rgba(245, 158, 11, 0.4)',
          textColor: 'var(--color-warning)',
          bgIcon: 'rgba(245, 158, 11, 0.1)',
          archetype: 'The Spontaneous Transactor'
        };
      case 'Emotional Shopper':
        return {
          icon: <Heart size={32} />,
          badgeColor: 'var(--color-purple)',
          gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(244, 63, 94, 0.05) 100%)',
          borderColor: 'rgba(168, 85, 247, 0.25)',
          glowColor: 'rgba(168, 85, 247, 0.4)',
          textColor: 'var(--color-purple)',
          bgIcon: 'rgba(168, 85, 247, 0.1)',
          archetype: 'The Sentiment Spender'
        };
      default:
        return {
          icon: <Compass size={32} />,
          badgeColor: 'var(--text-secondary)',
          gradient: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
          borderColor: 'var(--panel-border)',
          glowColor: 'rgba(255, 255, 255, 0.1)',
          textColor: 'var(--text-primary)',
          bgIcon: 'rgba(255,255,255,0.05)',
          archetype: 'Financial Voyager'
        };
    }
  };

  const design = getPersonalityDesign(personalityType);

  // Financial Score status
  const getScoreStatus = (score) => {
    if (score >= 85) return { label: 'Optimal', color: 'var(--color-income)' };
    if (score >= 70) return { label: 'Strong', color: 'var(--color-cyan)' };
    if (score >= 50) return { label: 'Balanced', color: 'var(--color-primary)' };
    if (score >= 35) return { label: 'Needs Care', color: 'var(--color-warning)' };
    return { label: 'Volatile', color: 'var(--color-expense)' };
  };

  const scoreStatus = getScoreStatus(financialScore);

  // Circular gauge parameter calculations
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (financialScore / 100) * circumference;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Dashboard Header */}
      <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="welcome-section">
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-primary)' }}>
            <motion.span
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              style={{ display: 'inline-flex', color: 'var(--color-primary)' }}
            >
              <Dna size={28} />
            </motion.span>
            Financial DNA
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Advanced behavioral profile and personality sequencing</p>
        </div>

        <button 
          onClick={handleRegenerate} 
          disabled={regenerating} 
          className="btn btn-primary"
          style={{ 
            opacity: regenerating ? 0.75 : 1, 
            cursor: regenerating ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <RefreshCw size={16} className={regenerating ? "animate-spin" : ""} style={{ animation: regenerating ? 'spin 1s linear infinite' : 'none' }} />
          {regenerating ? 'Sequencing DNA...' : 'Regenerate Analysis'}
        </button>
      </div>

      {/* Main Grid: Card & Circle Score */}
      <div className="dna-main-grid">
        
        {/* Dominant Personality Premium Card */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
          style={{
            background: design.gradient,
            border: `1px solid ${design.borderColor}`,
            boxShadow: `0 8px 32px 0 rgba(0,0,0,0.25), inset 0 0 15px ${design.glowColor}`,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '2rem'
          }}
        >
          {/* Ambient Glow effect inside the card */}
          <div style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, ${design.glowColor} 0%, transparent 70%)`,
            pointerEvents: 'none'
          }} />

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  letterSpacing: '1px', 
                  textTransform: 'uppercase', 
                  color: design.textColor,
                  backgroundColor: design.bgIcon,
                  padding: '4px 10px',
                  borderRadius: '20px'
                }}>
                  {design.archetype}
                </span>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem', letterSpacing: '-0.5px' }}>
                  {personalityType}
                </h2>
              </div>
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 10 }}
                style={{ 
                  color: design.textColor, 
                  backgroundColor: design.bgIcon,
                  padding: '1rem', 
                  borderRadius: '16px',
                  boxShadow: `0 4px 15px rgba(0,0,0,0.15)`
                }}
              >
                {design.icon}
              </motion.div>
            </div>

            <p style={{ color: 'var(--text-primary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem', fontWeight: '500' }}>
              {description}
            </p>
          </div>

          <div style={{ borderTop: '1px solid var(--panel-border)', paddingTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={16} style={{ color: 'var(--color-warning)' }} />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Classified by {analysisSource === 'gemini' ? 'Gemini AI plus local guardrails' : 'local behavioral rules'} with {confidence || 70}% confidence.
            </span>
          </div>
        </motion.div>

        {/* Financial DNA Score Circular Gauge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
            Financial Health Score
          </h3>

          <div style={{ position: 'relative', width: '150px', height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="150" height="150" viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke="rgba(255,255,255,0.03)"
                strokeWidth={strokeWidth}
              />
              {/* Foreground animated gauge with glowing effect */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                fill="transparent"
                stroke={`url(#scoreGradient)`}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: strokeDashoffset }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                strokeLinecap="round"
                style={{ filter: `drop-shadow(0 0 4px ${scoreStatus.color})` }}
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--color-primary)" />
                  <stop offset="100%" stopColor={scoreStatus.color} />
                </linearGradient>
              </defs>
            </svg>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: '1', letterSpacing: '-1px' }}>
                {financialScore}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, marginTop: '2px' }}>
                out of 100
              </span>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <span style={{ 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: scoreStatus.color,
              backgroundColor: `${scoreStatus.color}15`, 
              padding: '6px 16px', 
              borderRadius: '20px',
              border: `1px solid ${scoreStatus.color}25`
            }}>
              {scoreStatus.label} Standing
            </span>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '1rem', maxWidth: '220px' }}>
              Based on {metrics?.totalTxCount || 0} expense transactions, {metrics?.wantsRatio || 0}% wants share, and {currencySymbol} cash-flow patterns.
            </p>
          </div>
        </motion.div>

      </div>

      {/* Trait Slider Axes */}
      <div className="glass-panel">
        <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          <Compass size={20} style={{ color: 'var(--color-primary)' }} />
          Financial DNA Behavioral Traits
        </h3>

        <div className="dna-trait-grid">
          
          {/* Axis 1: Rationality */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-purple)' }}>Emotional Spending</span>
              <span style={{ color: 'var(--color-income)' }}>Rational Spending</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '99px', position: 'relative', margin: '0.25rem 0' }}>
              <motion.div 
                initial={{ left: '50%' }}
                animate={{ left: `${traits.rationality}%` }}
                transition={{ duration: 1, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                  border: '3px solid var(--color-primary)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px var(--color-primary-glow)',
                  cursor: 'pointer'
                }}
              />
              {/* Fill Indicator */}
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                width: `${traits.rationality}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-income), var(--color-primary))', 
                borderRadius: '99px 0 0 99px',
                opacity: 0.7 
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Comfort & Wants Led</span>
              <span>Utility & Needs Led</span>
            </div>
          </div>

          {/* Axis 2: Planning */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-warning)' }}>Spontaneous Shopping</span>
              <span style={{ color: 'var(--color-cyan)' }}>Planned Allocations</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '99px', position: 'relative', margin: '0.25rem 0' }}>
              <motion.div 
                initial={{ left: '50%' }}
                animate={{ left: `${traits.planning}%` }}
                transition={{ duration: 1, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                  border: '3px solid var(--color-primary)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px var(--color-primary-glow)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                width: `${traits.planning}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-cyan), var(--color-primary))', 
                borderRadius: '99px 0 0 99px',
                opacity: 0.7 
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Instant Purchase Drivers</span>
              <span>Strategic & Deliberate</span>
            </div>
          </div>

          {/* Axis 3: Discipline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-expense)' }}>Cap Overruns</span>
              <span style={{ color: 'var(--color-cyan)' }}>Budget Compliance</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '99px', position: 'relative', margin: '0.25rem 0' }}>
              <motion.div 
                initial={{ left: '50%' }}
                animate={{ left: `${traits.discipline}%` }}
                transition={{ duration: 1, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                  border: '3px solid var(--color-primary)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px var(--color-primary-glow)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                width: `${traits.discipline}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-cyan), var(--color-primary))', 
                borderRadius: '99px 0 0 99px',
                opacity: 0.7 
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Frequent Budget Breaches</span>
              <span>Stays in Category Envelopes</span>
            </div>
          </div>

          {/* Axis 4: Velocity */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-warning)' }}>Weekend Spending Spikes</span>
              <span style={{ color: 'var(--color-income)' }}>Balanced Pacing</span>
            </div>
            <div style={{ height: '8px', backgroundColor: 'var(--bg-secondary)', borderRadius: '99px', position: 'relative', margin: '0.25rem 0' }}>
              <motion.div 
                initial={{ left: '50%' }}
                animate={{ left: `${traits.velocity}%` }}
                transition={{ duration: 1, type: 'spring' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--text-primary)',
                  border: '3px solid var(--color-primary)',
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 10px var(--color-primary-glow)',
                  cursor: 'pointer'
                }}
              />
              <div style={{ 
                position: 'absolute', 
                left: 0, 
                width: `${traits.velocity}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--color-income), var(--color-primary))', 
                borderRadius: '99px 0 0 99px',
                opacity: 0.7 
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>Concentrated Weekend Leaks</span>
              <span>Steady Daily Outflow</span>
            </div>
          </div>

        </div>
      </div>

      {/* Double Column: Strengths & Weaknesses */}
      <div className="dna-insight-grid">
        
        {/* Strengths Card */}
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-income)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle size={20} style={{ color: 'var(--color-income)' }} />
            Financial DNA Strengths
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {strengths.map((str, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.01, translateX: 4 }}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.02)',
                  border: '1px solid rgba(16, 185, 129, 0.08)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)'
                }}
              >
                {str}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Weaknesses Card */}
        <div className="glass-panel" style={{ borderLeft: '4px solid var(--color-expense)' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertTriangle size={20} style={{ color: 'var(--color-expense)' }} />
            Areas of Optimization
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {weaknesses.map((weak, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.01, translateX: 4 }}
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(244, 63, 94, 0.02)',
                  border: '1px solid rgba(244, 63, 94, 0.08)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  color: 'var(--text-primary)'
                }}
              >
                {weak}
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      {/* Monthly Personality Evolution Graph */}
      <div className="glass-panel">
        <div className="chart-title">
          <span>Monthly Personality Evolution</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            6-Month Historical Track <ArrowUpRight size={14} />
          </span>
        </div>

        <div style={{ width: '100%', height: '280px', marginTop: '1.5rem' }}>
          {evolution && evolution.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--panel-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--text-muted)" 
                  fontSize={11} 
                  tickLine={false} 
                  tickFormatter={(val) => {
                    const [year, month] = val.split('-');
                    const date = new Date(year, month - 1);
                    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
                  }}
                />
                <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="glass-panel" style={{ padding: '0.75rem 1rem', border: '1px solid var(--panel-border)', borderRadius: '12px' }}>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                            {new Date(data.month + '-02').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </p>
                          <p style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-primary)', margin: '4px 0' }}>
                            Score: {data.score}
                          </p>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 700, 
                            color: getPersonalityDesign(data.personalityType).textColor,
                            backgroundColor: getPersonalityDesign(data.personalityType).bgIcon,
                            padding: '2px 8px',
                            borderRadius: '12px'
                          }}>
                            {data.personalityType}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="var(--color-primary)" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#scoreColor)" 
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    const dotColor = getPersonalityDesign(payload.personalityType).textColor;
                    return (
                      <svg x={cx - 6} y={cy - 6} width={12} height={12}>
                        <circle cx={6} cy={6} r={5} fill="var(--bg-primary)" stroke={dotColor} strokeWidth={3} style={{ filter: `drop-shadow(0 0 3px ${dotColor})` }} />
                      </svg>
                    );
                  }}
                  activeDot={{ r: 8 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Inadequate historical data to model evolution. Sequenced DNA needs multi-week logging.
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
};

export default FinancialDNA;
