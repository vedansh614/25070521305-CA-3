import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  User,
  Calendar,
  LogOut,
  Shield,
  Menu,
  X,
  Compass,
  Home,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const closeMobile = () => setMobileMenuOpen(false);

  return (
    <header className="navbar-header" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backgroundColor: 'rgba(7, 13, 24, 0.92)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--header-height)',
      }}>
        {/* PlayArena Wordmark */}
        <Link to="/" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)',
          }}>
            <Trophy size={22} color="#f8fafc" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.4rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1,
            }}>
              PLAY<span style={{ color: 'var(--lime-400)' }}>ARENA</span>
            </span>
            <span style={{
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              fontWeight: 600,
            }}>
              Turf & Court Booking
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-nav">
          <NavLink
            to="/"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive ? 'var(--lime-400)' : 'var(--text-muted)',
              padding: '0.4rem 0.6rem',
            })}
          >
            <Home size={16} /> Home
          </NavLink>

          <NavLink
            to="/venues"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: isActive ? 'var(--lime-400)' : 'var(--text-muted)',
              padding: '0.4rem 0.6rem',
            })}
          >
            <Compass size={16} /> Explore Venues
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/my-bookings"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: isActive ? 'var(--lime-400)' : 'var(--text-muted)',
                padding: '0.4rem 0.6rem',
              })}
            >
              <Calendar size={16} /> My Bookings
            </NavLink>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.95rem',
                fontWeight: 600,
                color: isActive ? 'var(--lime-400)' : '#f59e0b',
                padding: '0.4rem 0.6rem',
              })}
            >
              <Shield size={16} /> Admin Portal
            </NavLink>
          )}
        </nav>

        {/* User / Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }} className="desktop-auth">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/profile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--emerald-500)',
                  color: '#04121e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                }}>
                  {user?.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <span>{user?.name}</span>
                {isAdmin && (
                  <span style={{
                    fontSize: '0.65rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}>
                    ADMIN
                  </span>
                )}
              </Link>

              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '0.5rem 0.85rem', fontSize: '0.85rem' }}
                title="Log Out"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary" style={{ padding: '0.55rem 1rem' }}>
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '0.55rem 1.15rem' }}>
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            color: 'var(--text-main)',
            padding: '0.5rem',
          }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          <Link to="/" onClick={closeMobile} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
            Home
          </Link>
          <Link to="/venues" onClick={closeMobile} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
            Explore Venues
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/my-bookings" onClick={closeMobile} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                My Bookings
              </Link>
              <Link to="/profile" onClick={closeMobile} style={{ padding: '0.5rem 0', fontWeight: 600 }}>
                Profile ({user?.name})
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={closeMobile} style={{ padding: '0.5rem 0', color: '#f59e0b', fontWeight: 600 }}>
                  Admin Dashboard
                </Link>
              )}
              <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', marginTop: '0.5rem' }}>
                <LogOut size={16} /> Logout
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={closeMobile} className="btn btn-secondary" style={{ width: '100%' }}>
                Log In
              </Link>
              <Link to="/signup" onClick={closeMobile} className="btn btn-primary" style={{ width: '100%' }}>
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-auth {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
