import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validate()) return;

    setLoading(true);
    try {
      const res = await signup(formData);
      // On success, redirect to Login with friendly message
      navigate('/login', {
        state: {
          signupSuccess: true,
          message: 'Account created successfully! Please log in with your credentials.',
        },
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - var(--header-height))',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
      backgroundColor: 'var(--bg-primary)',
    }}>
      {/* Left Column: Visual Sports Hero */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '3rem 2.5rem',
        backgroundImage: `linear-gradient(180deg, rgba(7, 13, 24, 0.4) 0%, rgba(7, 13, 24, 0.95) 100%), url('/images/venues/cricket-turf-02.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRight: '1px solid var(--border-subtle)',
      }}>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '480px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'var(--emerald-500)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Trophy size={20} color="#04121e" />
            </div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.4rem', fontWeight: 800 }}>
              PLAY<span style={{ color: 'var(--lime-400)' }}>ARENA</span>
            </span>
          </div>

          <h2 style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem' }}>
            Join the Premier Sports Turf Community
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Reserve box cricket, football pitches, badminton courts, and basketball arenas in seconds with live database protection and pay-at-venue convenience.
          </p>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '440px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Create an Account
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: 'var(--lime-400)', fontWeight: 600 }}>
                Log in here
              </Link>
            </p>
          </div>

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="e.g. Rohan Sharma"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
              {validationErrors.name && (
                <span className="form-error">{validationErrors.name}</span>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="rohan@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={loading}
              />
              {validationErrors.email && (
                <span className="form-error">{validationErrors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <span className="form-error">{validationErrors.password}</span>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Repeat your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                disabled={loading}
              />
              {validationErrors.confirmPassword && (
                <span className="form-error">{validationErrors.confirmPassword}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
            >
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
