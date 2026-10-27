import React from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ShieldCheck, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      marginTop: 'auto',
      backgroundColor: 'var(--bg-surface)',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '3rem',
      paddingBottom: '2rem',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'var(--emerald-500)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Trophy size={18} color="#04121e" />
              </div>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
              }}>
                PLAY<span style={{ color: 'var(--lime-400)' }}>ARENA</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              Instant, real-time sports turf and court reservation system. Book verified box cricket turfs, football arenas, badminton halls, and basketball courts across Nagpur, Pune, and Mumbai.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li>
                <Link to="/" style={{ color: 'var(--text-muted)' }}>Home</Link>
              </li>
              <li>
                <Link to="/venues" style={{ color: 'var(--text-muted)' }}>Explore All Venues</Link>
              </li>
              <li>
                <Link to="/venues?sport=cricket" style={{ color: 'var(--text-muted)' }}>Box Cricket Turfs</Link>
              </li>
              <li>
                <Link to="/venues?sport=football" style={{ color: 'var(--text-muted)' }}>Football Grounds</Link>
              </li>
              <li>
                <Link to="/venues?sport=badminton" style={{ color: 'var(--text-muted)' }}>Badminton Courts</Link>
              </li>
            </ul>
          </div>

          {/* Supported Cities */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>
              Active Cities
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="var(--emerald-400)" /> Nagpur (Dharampeth, IT Park, Wardha Rd)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="var(--emerald-400)" /> Pune (Baner, Balewadi, Kalyani Nagar)
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <MapPin size={14} color="var(--emerald-400)" /> Mumbai (Andheri West, Dadar, Marine Lines)
              </li>
            </ul>
          </div>

          {/* Academic & Viva Project Notice */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--lime-400)' }}>
              Academic Project (CA-03)
            </h4>
            <div style={{
              backgroundColor: 'rgba(17, 34, 59, 0.6)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}>
              <p style={{ marginBottom: '0.4rem' }}>
                <strong>Provisional PRN:</strong> 25070521305
              </p>
              <p style={{ color: '#fbbf24', fontSize: '0.75rem' }}>
                Note: All venue listings, prices, and bookings are fictional demonstration data created for college project evaluation and viva defense.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
        }}>
          <div>
            © {new Date().getFullYear()} PLAYARENA. Continuous Assessment CA-03 Submission.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Pay-At-Venue Guarantee</span>
            <span>Real-time Socket Sync</span>
            <span>MongoDB Atomic Concurrency</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
