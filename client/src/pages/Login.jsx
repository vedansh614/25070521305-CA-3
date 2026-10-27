import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Check if redirected from successful signup
  const signupSuccessMessage = location.state?.signupSuccess ? location.state?.message : null;
  const returnTo = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Please enter both your email address and password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      // Redirect to target booking flow or Home
      navigate(returnTo, { replace: true });
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password. Please try again.');
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
      {/* Visual Left Column */}
      <div style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        padding: '3rem 2.5rem',
        backgroundImage: `linear-gradient(180deg, rgba(7, 13, 24, 0.45) 0%, rgba(7, 13, 24, 0.95) 100%), url('/images/venues/football-turf-01.jpg')`,
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
            Welcome Back, Player
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
            Access your bookings, print match tickets, and reserve turf slots across Nagpur, Pune, and Mumbai.
          </p>
        </div>
      </div>

      {/* Login Form Column */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 2rem',
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Account Login
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Don’t have an account yet?{' '}
              <Link to="/signup" style={{ color: 'var(--lime-400)', fontWeight: 600 }}>
                Sign up here
              </Link>
            </p>
          </div>

          {/* Registration Success Banner */}
          {signupSuccessMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--success-bg)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--radius-md)',
              color: '#6ee7b7',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>{signupSuccessMessage}</span>
            </div>
          )}

          {/* Error Banner */}
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

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                  required
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
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', marginTop: '1.25rem', padding: '0.8rem' }}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Credentials Reminder for Viva */}
          <div style={{
            marginTop: '2rem',
            padding: '0.85rem',
            backgroundColor: 'rgba(12, 26, 45, 0.7)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
          }}>
            <div style={{ fontWeight: 700, color: 'var(--lime-400)', marginBottom: '0.25rem' }}>
              College Viva Demo Account:
            </div>
            <div>Admin: <code>admin@playarena.local</code> / <code>AdminSecure@2026</code></div>
            <div>Or create a new player account with the signup button above.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
