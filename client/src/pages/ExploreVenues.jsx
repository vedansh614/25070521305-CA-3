import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import VenueCard from '../components/VenueCard';
import {
  Search,
  Filter,
  X,
  Compass,
  ArrowUpDown,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';

export default function ExploreVenues() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [sport, setSport] = useState(searchParams.get('sport') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || '');

  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync state changes to URL search params & fetch
  useEffect(() => {
    const params = new URLSearchParams();
    if (search.trim()) params.set('search', search.trim());
    if (city) params.set('city', city);
    if (sport) params.set('sport', sport);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (sortBy) params.set('sortBy', sortBy);

    setSearchParams(params, { replace: true });

    async function fetchFilteredVenues() {
      setLoading(true);
      setError(null);
      try {
        const query = params.toString();
        const res = await api.get(`/api/venues${query ? `?${query}` : ''}`);
        if (res && res.venues) {
          setVenues(res.venues);
        }
      } catch (err) {
        setError(err.message || 'Failed to retrieve venues.');
      } finally {
        setLoading(false);
      }
    }

    fetchFilteredVenues();
  }, [search, city, sport, maxPrice, sortBy]);

  const handleClearFilters = () => {
    setSearch('');
    setCity('');
    setSport('');
    setMaxPrice('');
    setSortBy('');
  };

  const hasActiveFilters = Boolean(search || city || sport || maxPrice || sortBy);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          color: 'var(--lime-400)',
          fontWeight: 700,
          fontSize: '0.85rem',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '0.5rem',
        }}>
          <Compass size={16} /> Verified Ground Listings
        </div>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Explore Sports Turfs & Courts
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '650px' }}>
          Filter grounds by your favorite sport, target city (Nagpur, Pune, Mumbai), or hourly price budget.
        </p>
      </div>

      {/* Filter & Search Control Panel */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        marginBottom: '2.5rem',
        boxShadow: 'var(--shadow-md)',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'flex-end',
        }}>
          {/* Keyword Search */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Search size={14} /> Search Venue Name / Area
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Balewadi, Shivaji Park..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* City Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">City Location</label>
            <select
              className="form-select"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="">All Supported Cities</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Pune">Pune</option>
              <option value="Mumbai">Mumbai</option>
            </select>
          </div>

          {/* Sport Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Sport Discipline</label>
            <select
              className="form-select"
              value={sport}
              onChange={(e) => setSport(e.target.value)}
            >
              <option value="">All Sports</option>
              <option value="cricket">Cricket / Box Turf</option>
              <option value="football">Football Turf</option>
              <option value="badminton">Badminton Court</option>
              <option value="basketball">Basketball Arena</option>
            </select>
          </div>

          {/* Max Price Filter */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">
              Max Price: {maxPrice ? `₹${maxPrice}/hr` : 'Any Budget'}
            </label>
            <select
              className="form-select"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            >
              <option value="">No Limit</option>
              <option value="700">Under ₹700 / hr</option>
              <option value="1000">Under ₹1,000 / hr</option>
              <option value="1300">Under ₹1,300 / hr</option>
              <option value="1600">Under ₹1,600 / hr</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ArrowUpDown size={14} /> Sort By Price
            </label>
            <select
              className="form-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="">Featured / Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Row */}
        {hasActiveFilters && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--lime-400)' }}>
              Active filters applied. Showing matching results below.
            </span>
            <button
              onClick={handleClearFilters}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem', gap: '0.35rem' }}
            >
              <RotateCcw size={14} /> Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
          {loading ? 'Finding available venues...' : `${venues.length} Venue${venues.length === 1 ? '' : 's'} Found`}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.25rem',
          backgroundColor: 'var(--danger-bg)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          marginBottom: '2rem',
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ height: '360px', opacity: 0.4 }} />
          ))}
        </div>
      ) : venues.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '0 auto',
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(148, 163, 184, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <Search size={26} color="var(--text-muted)" />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No Matching Venues Found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            No venues match your current combination of city, sport, and price filters. Try clearing your filters or widening your budget.
          </p>
          <button onClick={handleClearFilters} className="btn btn-primary">
            <RotateCcw size={16} /> Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {venues.map((venue) => (
            <VenueCard key={venue._id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}
