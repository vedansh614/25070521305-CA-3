import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import VenueCard from '../components/VenueCard';
import {
  Search,
  MapPin,
  Trophy,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export default function Home() {
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCity, setSearchCity] = useState('');
  const [searchSport, setSearchSport] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.get('/api/venues/featured');
        if (res && res.venues) {
          setFeaturedVenues(res.venues);
        }
      } catch (err) {
        console.error('Failed to load featured venues:', err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchCity) params.set('city', searchCity);
    if (searchSport) params.set('sport', searchSport);
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    navigate(`/venues?${params.toString()}`);
  };

  const sportsCategories = [
    {
      id: 'cricket',
      name: 'Box Cricket',
      count: 'AstroTurf & Nets',
      icon: '🏏',
      image: '/images/categories/cricket.jpg',
    },
    {
      id: 'football',
      name: 'Football Turf',
      count: '5v5 & 7v7 Pitches',
      icon: '⚽',
      image: '/images/categories/football.jpg',
    },
    {
      id: 'badminton',
      name: 'Badminton Courts',
      count: 'BWF Wooden & Vinyl',
      icon: '🏸',
      image: '/images/categories/badminton.jpg',
    },
    {
      id: 'basketball',
      name: 'Basketball Courts',
      count: 'FIBA Acrylic & Poly',
      icon: '🏀',
      image: '/images/categories/basketball.jpg',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '3rem' }}>
      {/* HERO SECTION */}
      <section style={{
        position: 'relative',
        minHeight: '560px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 1.5rem',
        backgroundImage: `linear-gradient(180deg, rgba(7, 13, 24, 0.82) 0%, rgba(7, 13, 24, 0.95) 100%), url('/images/venues/cricket-turf-01.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '860px', position: 'relative', zIndex: 10 }}>
          {/* Sports Pill Tag */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            color: 'var(--lime-400)',
            fontSize: '0.85rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1.5rem',
          }}>
            <Zap size={16} /> Instant Real-Time Availability Updates
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.25rem',
          }}>
            Your Game. <span style={{ color: 'var(--emerald-400)' }}>Your Ground.</span> <span style={{ color: 'var(--lime-400)' }}>Your Time.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            maxWidth: '680px',
            margin: '0 auto 2.5rem',
          }}>
            Reserve floodlit box cricket turfs, football pitches, wooden badminton courts, and basketball arenas in Nagpur, Pune, and Mumbai with zero double-booking risk.
          </p>

          {/* Interactive Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.65rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) auto',
              gap: '0.65rem',
              boxShadow: 'var(--shadow-lg)',
              textAlign: 'left',
            }}
          >
            {/* City Select */}
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                style={{ width: '100%', border: 'none', backgroundColor: 'var(--bg-card)' }}
              >
                <option value="">All Cities (Nagpur, Pune, Mumbai)</option>
                <option value="Nagpur">Nagpur</option>
                <option value="Pune">Pune</option>
                <option value="Mumbai">Mumbai</option>
              </select>
            </div>

            {/* Sport Select */}
            <div>
              <select
                className="form-select"
                value={searchSport}
                onChange={(e) => setSearchSport(e.target.value)}
                style={{ width: '100%', border: 'none', backgroundColor: 'var(--bg-card)' }}
              >
                <option value="">All Sports Categories</option>
                <option value="cricket">Cricket / Box Turf</option>
                <option value="football">Football Turf</option>
                <option value="badminton">Badminton Court</option>
                <option value="basketball">Basketball Arena</option>
              </select>
            </div>

            {/* Keyword Input */}
            <div>
              <input
                type="text"
                className="form-input"
                placeholder="Search venue name or area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', border: 'none', backgroundColor: 'var(--bg-card)' }}
              />
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.75rem', fontWeight: 700 }}
            >
              <Search size={18} /> Search Slots
            </button>
          </form>
        </div>
      </section>

      {/* SPORTS CATEGORIES */}
      <section className="container">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Choose Your Sport
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Book tournament-grade courts and pitches configured for professional play.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
        }}>
          {sportsCategories.map((cat) => (
            <Link
              key={cat.id}
              to={`/venues?sport=${cat.id}`}
              className="card"
              style={{
                position: 'relative',
                height: '180px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                padding: '1.25rem',
              }}
            >
              <img
                src={cat.image}
                alt={`${cat.name} venues`}
                loading="lazy"
                decoding="async"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.35,
                  transition: 'transform 0.4s ease, opacity 0.4s ease',
                }}
                className="cat-bg"
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(180deg, transparent 20%, rgba(7, 13, 24, 0.95) 100%)',
              }} />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '1.75rem', marginBottom: '0.35rem' }}>
                  {cat.icon}
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {cat.name}
                </h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--emerald-400)', fontWeight: 600 }}>
                  {cat.count} →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED VENUES */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Featured Sports Grounds
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Handpicked verified turfs in Nagpur, Pune, and Mumbai with active live scheduling.
            </p>
          </div>

          <Link to="/venues" className="btn btn-secondary">
            Explore All Venues <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card" style={{ height: '360px', opacity: 0.5 }} />
            ))}
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {featuredVenues.map((venue) => (
              <VenueCard key={venue._id} venue={venue} />
            ))}
          </div>
        )}
      </section>

      {/* HOW IT WORKS SECTION */}
      <section style={{
        backgroundColor: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-subtle)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '4rem 1.5rem',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            How PlayArena Works
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
            A fast, 3-step transparent reservation experience designed for passionate sports players.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2rem',
          }}>
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'left',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                color: 'var(--emerald-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '1.25rem',
              }}>
                1
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Pick Venue & Sport
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Filter by sport, city, or hourly budget. View actual turf surface details, floodlight specs, and photos.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'left',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(163, 230, 53, 0.15)',
                color: 'var(--lime-400)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '1.25rem',
              }}>
                2
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Select Real-Time Slot
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Choose any date within our rolling 14-day window. Live database constraints lock your slot atomically so nobody steals it.
              </p>
            </div>

            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-lg)',
              padding: '2rem 1.5rem',
              textAlign: 'left',
            }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.2rem',
                marginBottom: '1.25rem',
              }}>
                3
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                Pay At Venue & Play
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
                Get an instant booking ticket with a unique confirmation code. Pay via UPI or Cash directly at the turf counter on match day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="container">
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--emerald-500)',
          borderRadius: 'var(--radius-lg)',
          padding: '3rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '1.5rem',
          boxShadow: '0 0 35px rgba(16, 185, 129, 0.15)',
        }}>
          <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.4rem)', fontWeight: 800 }}>
            Ready to Take the Field?
          </h2>
          <p style={{ color: 'var(--text-muted)', maxWidth: '580px', fontSize: '1rem', lineHeight: 1.6 }}>
            Browse through our sports arenas in Nagpur, Pune, and Mumbai. See available hours and secure your game slot in seconds.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link to="/venues" className="btn btn-lime" style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}>
              Explore All Sports Venues <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .card:hover .cat-bg {
          transform: scale(1.08);
          opacity: 0.5;
        }
      `}</style>
    </div>
  );
}
