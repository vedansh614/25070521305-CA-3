import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SlotPicker from '../components/SlotPicker';
import { getSportFallback } from '../components/VenueCard';
import {
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Trophy,
  ChevronLeft,
  Sparkles,
  AlertCircle,
} from 'lucide-react';

export default function VenueDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [venue, setVenue] = useState(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Slot and date state
  const [selectedDate, setSelectedDate] = useState('');
  const [allowedDates, setAllowedDates] = useState([]);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  // 1. Fetch Venue Details
  useEffect(() => {
    async function loadVenue() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/venues/${id}`);
        if (res && res.venue) {
          setVenue(res.venue);
        }
      } catch (err) {
        setError(err.message || 'Venue not found or inactive.');
      } finally {
        setLoading(false);
      }
    }
    loadVenue();
  }, [id]);

  // 2. Fetch Slots for Selected Date
  const loadSlots = useCallback(
    async (date) => {
      if (!id) return;
      setSlotsLoading(true);
      try {
        const url = `/api/venues/${id}/slots${date ? `?date=${date}` : ''}`;
        const res = await api.get(url);
        if (res) {
          setSelectedDate(res.date);
          setAllowedDates(res.allowedDates || []);
          setSlots(res.slots || []);

          // Clear selected slot if it got booked in real-time
          if (selectedSlot) {
            const updated = res.slots.find((s) => s.slotLabel === selectedSlot.slotLabel);
            if (!updated || !updated.isAvailable) {
              setSelectedSlot(null);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    },
    [id, selectedSlot]
  );

  // Initial slot load
  useEffect(() => {
    if (venue) {
      loadSlots('');
    }
  }, [venue]);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setSelectedSlot(null);
    loadSlots(newDate);
  };

  const handleSlotSelect = (slot) => {
    if (selectedSlot?.slotLabel === slot.slotLabel) {
      setSelectedSlot(null); // Toggle unselect
    } else {
      setSelectedSlot(slot);
    }
  };

  const handleProceedToReview = () => {
    if (!selectedSlot) return;

    const reviewUrl = `/book/${venue._id}?date=${selectedDate}&slot=${encodeURIComponent(selectedSlot.slotLabel)}`;

    if (!isAuthenticated) {
      // Prompt user to log in first and remember reviewUrl
      navigate('/login', { state: { from: reviewUrl } });
      return;
    }

    navigate(reviewUrl);
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading venue details...</p>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '500px' }}>
        <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Venue Unavailable</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error || 'Venue could not be found.'}</p>
        <Link to="/venues" className="btn btn-primary">
          <ChevronLeft size={16} /> Back to Venues
        </Link>
      </div>
    );
  }

  const fallbackImg = getSportFallback(venue.sport);
  const images = venue.images && venue.images.length > 0 ? venue.images : [fallbackImg];
  const currentMainImage = images[selectedImageIdx] || images[0] || fallbackImg;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Breadcrumb Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link to="/venues" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ChevronLeft size={16} /> Explore Venues
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{venue.name}</span>
      </div>

      {/* Main Grid: Gallery & Info (Left) + Slot Reservation Card (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
        alignItems: 'start',
      }}>
        {/* Left Column: Image Gallery & Details */}
        <div>
          {/* Main Gallery Image */}
          <div style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/10',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            backgroundColor: '#07111e',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
          }}>
            <img
              src={currentMainImage}
              alt={`${venue.name} - ${venue.sport} in ${venue.city}`}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onError={(e) => {
                if (e.target.src !== window.location.origin + fallbackImg && !e.target.src.endsWith(fallbackImg)) {
                  e.target.src = fallbackImg;
                }
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                transition: 'opacity 0.3s ease',
              }}
            />
            <div style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              display: 'flex',
              gap: '0.5rem',
            }}>
              <span className="badge badge-sport" style={{ textTransform: 'capitalize' }}>
                {venue.sport}
              </span>
              <span className="badge badge-city">
                {venue.city}
              </span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIdx(idx)}
                  aria-label={`View photo ${idx + 1}`}
                  style={{
                    width: '84px',
                    height: '56px',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden',
                    border: selectedImageIdx === idx ? '2px solid var(--lime-400)' : '1px solid var(--border-subtle)',
                    opacity: selectedImageIdx === idx ? 1 : 0.65,
                    flexShrink: 0,
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                    padding: 0,
                    backgroundColor: '#07111e',
                  }}
                >
                  <img
                    src={img}
                    alt={`${venue.name} preview ${idx + 1}`}
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      if (e.target.src !== window.location.origin + fallbackImg && !e.target.src.endsWith(fallbackImg)) {
                        e.target.src = fallbackImg;
                      }
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Venue Info */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.6rem' }}>
              {venue.name}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
              <MapPin size={16} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
              <span>{venue.address}</span>
            </div>

            <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2rem' }}>
              {venue.description}
            </p>

            {/* Operating Hours & Surface Details */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem',
            }}>
              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                  <Clock size={14} color="var(--emerald-400)" /> Operating Hours
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  {String(venue.openingHours?.open || 6).padStart(2, '0')}:00 - {String(venue.openingHours?.close || 23).padStart(2, '0')}:00 IST
                </div>
              </div>

              <div style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                  <Trophy size={14} color="var(--lime-400)" /> Turf Unit Scope
                </div>
                <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                  1 Dedicated Court / Turf
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.85rem' }}>
                Included Amenities
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {venue.amenities?.map((amenity, i) => (
                  <span
                    key={i}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.4rem 0.85rem',
                      backgroundColor: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.85rem',
                      color: 'var(--text-main)',
                    }}
                  >
                    <CheckCircle2 size={14} color="var(--emerald-400)" /> {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Slot Selection Engine */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          boxShadow: 'var(--shadow-lg)',
          position: 'sticky',
          top: 'calc(var(--header-height) + 1.5rem)',
        }}>
          {/* Price Header */}
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            paddingBottom: '1.25rem',
            borderBottom: '1px solid var(--border-subtle)',
            marginBottom: '1.5rem',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                Rate Per Slot (1 Hour)
              </span>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--lime-400)' }}>
                ₹{(venue.pricePerHour || venue.hourlyPrice)?.toLocaleString('en-IN')}
                <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}> / hour</span>
              </div>
            </div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--emerald-400)',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              <ShieldCheck size={14} /> Pay at Venue
            </div>
          </div>

          {/* Real-Time Interactive Slot Picker */}
          <SlotPicker
            venueId={venue._id}
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            allowedDates={allowedDates}
            slots={slots}
            selectedSlot={selectedSlot}
            onSlotSelect={handleSlotSelect}
            loading={slotsLoading}
            onRefreshSlots={() => loadSlots(selectedDate)}
          />

          {/* Proceed Action Bar */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
            {selectedSlot ? (
              <div style={{ marginBottom: '1rem', backgroundColor: 'rgba(163, 230, 53, 0.1)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(163, 230, 53, 0.3)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--lime-400)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Ready For Review
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                  {selectedDate} • {selectedSlot.slotLabel}
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Please click on an available time slot above to continue.
              </div>
            )}

            <button
              onClick={handleProceedToReview}
              disabled={!selectedSlot}
              className="btn btn-lime"
              style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', fontWeight: 700 }}
            >
              {isAuthenticated ? 'Proceed to Booking Review' : 'Log In to Reserve Slot'} <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
