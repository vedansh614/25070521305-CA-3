import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ChevronLeft,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';

export default function BookingReview() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const bookingDate = searchParams.get('date');
  const slotLabel = searchParams.get('slot');

  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [slotConflict, setSlotConflict] = useState(false);

  // Guard: if not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: { from: `/book/${id}?date=${bookingDate}&slot=${encodeURIComponent(slotLabel || '')}` },
        replace: true,
      });
      return;
    }

    async function loadVenueInfo() {
      try {
        const res = await api.get(`/api/venues/${id}`);
        if (res && res.venue) {
          setVenue(res.venue);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Unable to retrieve venue details.');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadVenueInfo();
    }
  }, [id, isAuthenticated, navigate, bookingDate, slotLabel]);

  const handleConfirmBooking = async () => {
    if (submitting) return; // Prevent repeated clicks
    setErrorMsg('');
    setSlotConflict(false);
    setSubmitting(true);

    try {
      // Pass client idempotencyKey to prevent duplicate records on rapid re-submission
      const idempotencyKey = `idemp_${user._id}_${id}_${bookingDate}_${slotLabel}_${Date.now()}`;

      const res = await api.post('/api/bookings', {
        venueId: id,
        bookingDate,
        slotLabel,
        idempotencyKey,
      });

      if (res && res.booking) {
        // Navigate immediately to ticket
        navigate(`/bookings/${res.booking._id}/ticket`, { replace: true });
      }
    } catch (err) {
      if (err.status === 409 || err.code === 'SLOT_CONFLICT') {
        setSlotConflict(true);
        setErrorMsg('This slot was just confirmed by another player while you were reviewing. Please return and select a different slot.');
      } else {
        setErrorMsg(err.message || 'Failed to confirm booking. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!bookingDate || !slotLabel) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Missing Slot Selection</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Please select a valid date and time slot first.</p>
        <Link to={`/venues/${id}`} className="btn btn-primary">
          Select Slot
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Preparing booking review...</p>
      </div>
    );
  }

  const price = venue?.pricePerHour || venue?.hourlyPrice || 0;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', maxWidth: '820px' }}>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        <Link to={`/venues/${id}`} style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <ChevronLeft size={16} /> Back to Venue
        </Link>
        <span style={{ color: 'var(--text-dim)' }}>/</span>
        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Review & Confirm</span>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.4rem' }}>
          Review Your Slot Reservation
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Verify your ground details, match timings, and pay-at-venue terms before confirming.
        </p>
      </div>

      {/* Conflict / Error Banner */}
      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1.25rem',
          backgroundColor: 'var(--danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
          marginBottom: '2rem',
        }}>
          <AlertCircle size={22} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
              {slotConflict ? 'Slot Conflict Detected' : 'Booking Error'}
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
              {errorMsg}
            </div>
            {slotConflict && (
              <div style={{ marginTop: '0.85rem' }}>
                <Link to={`/venues/${id}`} className="btn btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
                  <ChevronLeft size={14} /> Return to Slot Grid
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        boxShadow: 'var(--shadow-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Venue Row */}
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
            Sports Turf & Court
          </span>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
            {venue?.name}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            <MapPin size={15} color="var(--emerald-400)" />
            <span>{venue?.address}</span>
          </div>
        </div>

        {/* Date and Time Breakdown */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
              <Calendar size={15} color="var(--emerald-400)" /> Match Date
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {bookingDate}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
              <Clock size={15} color="var(--lime-400)" /> Reserved Slot
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--lime-400)' }}>
              {slotLabel} (IST)
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
              <CheckCircle2 size={15} color="var(--emerald-400)" /> Customer Name
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {user?.name}
            </div>
          </div>
        </div>

        {/* Pricing Summary (Calculated by Server) */}
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            Price Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.925rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>1 Hour Court / Turf Reservation Rate</span>
              <span>₹{price.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
              <span>Platform Convenience Fee (Academic Demo)</span>
              <span style={{ color: 'var(--emerald-400)' }}>₹0 (Free)</span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              paddingTop: '0.85rem',
              borderTop: '1px solid var(--border-subtle)',
              fontWeight: 800,
              fontSize: '1.25rem',
              color: 'var(--lime-400)',
            }}>
              <span>Total Payable at Ground</span>
              <span>₹{price.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Pay-At-Venue Guarantee Notice */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.85rem',
          padding: '1.25rem',
          backgroundColor: 'rgba(16, 185, 129, 0.08)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-md)',
        }}>
          <ShieldCheck size={22} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--text-main)', display: 'block', marginBottom: '0.2rem' }}>
              Payment Method: Pay At Venue
            </strong>
            <span style={{ color: 'var(--text-muted)' }}>
              No online credit card or prepayment is collected now. Your slot is officially reserved in the database under your name. Simply show your ticket reference at the venue desk and pay in Cash or UPI upon arrival.
            </span>
          </div>
        </div>

        {/* Cancellation Policy */}
        <div style={{
          fontSize: '0.8rem',
          color: 'var(--text-dim)',
          lineHeight: 1.5,
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1rem',
        }}>
          <strong>Flexible Cancellation Policy:</strong> You may cancel this slot reservation free of charge any time prior to the slot start hour from your <em>My Bookings</em> dashboard. Cancelled slots are released immediately for other players.
        </div>
      </div>

      {/* Confirm Action Button */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Link to={`/venues/${id}`} className="btn btn-secondary">
          Change Slot
        </Link>
        <button
          onClick={handleConfirmBooking}
          disabled={submitting || slotConflict}
          className="btn btn-lime"
          style={{ padding: '0.85rem 2rem', fontSize: '1rem', fontWeight: 800 }}
        >
          {submitting ? 'Locking Slot in Database...' : 'Confirm & Generate Ticket'} <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
