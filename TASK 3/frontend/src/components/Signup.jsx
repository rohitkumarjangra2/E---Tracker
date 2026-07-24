import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';

const Signup = ({ onToggleView }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Too Weak', class: 'weak' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  // Evaluate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, text: 'Too Weak', class: 'weak' });
      return;
    }

    let score = 0;

    // Rule 1: Length check
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;

    // Rule 2: Numbers & special chars check
    const hasNumbers = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    if (hasNumbers || hasSpecial) score += 1;

    // Rule 3: Upper & lower check
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    if (hasUpper && hasLower) score += 1;

    let text = 'Weak';
    let className = 'weak';
    let visualScore = 1;

    if (score >= 4) {
      text = 'Very Strong';
      className = 'strong';
      visualScore = 3;
    } else if (score >= 3) {
      text = 'Strong';
      className = 'strong';
      visualScore = 3;
    } else if (score >= 2) {
      text = 'Fair';
      className = 'fair';
      visualScore = 2;
    } else {
      text = 'Too Weak';
      className = 'weak';
      visualScore = 1;
    }

    setPasswordStrength({ score: visualScore, text, class: className });
  }, [password]);

  const validateForm = () => {
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return false;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return false;
    }
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);
    const result = await signup(username, email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setError(result.error || 'Signup failed. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo-wrapper">
            <UserPlus size={28} />
          </div>
          <h2>Create Account</h2>
          <p>Join us today to secure your digital workspace</p>
        </div>

        {error && (
          <div className="auth-alert auth-alert-error">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="input-label" htmlFor="username">Username</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                id="username"
                type="text"
                className="auth-input"
                placeholder="rohit123"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                id="email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {password && (
              <>
                <div className="strength-bar-container">
                  <div className={`strength-segment ${passwordStrength.score >= 1 ? passwordStrength.class : ''}`}></div>
                  <div className={`strength-segment ${passwordStrength.score >= 2 ? passwordStrength.class : ''}`}></div>
                  <div className={`strength-segment ${passwordStrength.score >= 3 ? passwordStrength.class : ''}`}></div>
                </div>
                <span className={`strength-text ${passwordStrength.class}`}>
                  Password Strength: {passwordStrength.text}
                </span>
              </>
            )}
          </div>

          <div className="form-group">
            <label className="input-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                className="auth-input"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (error) setError('');
                }}
                disabled={isSubmitting}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="input-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {confirmPassword && password && (
              <span className="strength-text" style={{ color: password === confirmPassword ? '#10b981' : '#f43f5e' }}>
                {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </span>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ marginTop: '2rem' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="spinner"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserPlus size={18} />
                <span>Sign Up</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <span className="auth-link" onClick={() => onToggleView('login')}>
            Sign in
          </span>
        </div>
      </div>
    </div>
  );
};

export default Signup;
