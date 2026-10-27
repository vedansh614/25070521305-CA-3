import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Home, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container" style={{
      minHeight: 'calc(100vh - var(--header-height) - 200px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 1.5rem',
    }}>
      <div style={{
        width: '72px',
        height: '72px',
        borderRadius: '20px',
        backgroundColor: 'rgba(239, 68, 68, 0.12)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
      }}>
        <Trophy size={36} color="var(--danger)" />
      </div>

      <div style={{
        fontFamily: 'monospace',
        fontSize: '4rem',
        fontWeight: 800,
        color: 'var(--lime-400)',
        lineHeight: 1,
        marginBottom: '0.5rem',
      }}>
        404
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        Out of Bounds! Page Not Found
      </h1>

      <p style={{
        color: 'var(--text-muted)',
        maxWidth: '480px',
        fontSize: '1rem',
        lineHeight: 1.6,
        marginBottom: '2rem',
      }}>
        The turf or page you are looking for has been moved, does not exist, or is currently off the playing field.
      </p>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary" style={{ gap: '0.5rem' }}>
          <Home size={18} /> Return to Home
        </Link>
        <Link to="/venues" className="btn btn-secondary" style={{ gap: '0.5rem' }}>
          <Compass size={18} /> Explore Venues
        </Link>
      </div>
    </div>
  );
}
