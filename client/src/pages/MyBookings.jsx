import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CancellationModal from '../components/CancellationModal';
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Ban,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export default function MyBookings() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('UPCOMING'); // 'UPCOMING' | 'PAST' | 'CANCELLED'

  // Cancellation Modal state
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: '/my-bookings' } });
      return;
    }

    async function fetchBookings() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/api/bookings/my');
        if (res && res.bookings) {
          setBookings(res.bookings);
        }
      } catch (err) {
        setError(err.message || 'Failed to load bookings.');
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleOpenCancelModal = (booking) => {
    setSelectedBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async (bookingId, reason) => {
    setCancelLoading(true);
    try {
      const res = await api.put(`/api/bookings/${bookingId}/cancel`, { reason });
      if (res && res.booking) {
        // Update local state without losing item from history
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, ...res.booking, category: 'CANCELLED' } : b))
        );
        setCancelModalOpen(false);
        setSelectedBookingToCancel(null);
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel reservation.');
    } finally {
      setCancelLoading(false);
    }
  };

  // Filter bookings according to active tab
  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'CANCELLED') return b.status === 'CANCELLED';
    if (activeTab === 'PAST') return b.status === 'CONFIRMED' && b.isPast;
    // UPCOMING
    return b.status === 'CONFIRMED' && !b.isPast;
  });

  const upcomingCount = bookings.filter((b) => b.status === 'CONFIRMED' && !b.isPast).length;
  const pastCount = bookings.filter((b) => b.status === 'CONFIRMED' && b.isPast).length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          My Bookings & Tickets
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Manage your upcoming matches, print entry tickets, and cancel slots when plans change.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        borderBottom: '1px solid var(--border-subtle)',
        paddingBottom: '0.75rem',
        marginBottom: '2rem',
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('UPCOMING')}
          className={`btn ${activeTab === 'UPCOMING' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.55rem 1.15rem' }}
        >
          Upcoming Matches ({upcomingCount})
        </button>

        <button
          onClick={() => setActiveTab('PAST')}
          className={`btn ${activeTab === 'PAST' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.55rem 1.15rem' }}
        >
          Past Sessions ({pastCount})
        </button>

        <button
          onClick={() => setActiveTab('CANCELLED')}
          className={`btn ${activeTab === 'CANCELLED' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.55rem 1.15rem' }}
        >
          Cancelled History ({cancelledCount})
        </button>
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading your booking history...
        </div>
      ) : error ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.25rem',
          backgroundColor: 'var(--danger-bg)',
          borderRadius: 'var(--radius-md)',
          color: '#fca5a5',
        }}>
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          maxWidth: '520px',
          margin: '0 auto',
        }}>
          <Calendar size={44} color="var(--text-dim)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            No {activeTab.toLowerCase()} bookings found
          </h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {activeTab === 'UPCOMING'
              ? 'You do not have any upcoming games reserved. Pick a sports ground now.'
              : `You have no ${activeTab.toLowerCase()} booking records in your profile history.`}
          </p>
          {activeTab === 'UPCOMING' && (
            <Link to="/venues" className="btn btn-primary">
              Explore Grounds & Book Slot
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredBookings.map((b) => {
            const venue = b.venueSnapshot || b.venue;
            const isConfirmed = b.status === 'CONFIRMED';
            const canCancel = isConfirmed && !b.isPast;

            return (
              <div
                key={b._id}
                className="card"
                style={{
                  padding: '1.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr)) auto',
                  gap: '1.5rem',
                  alignItems: 'center',
                }}
              >
                {/* Booking Info */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
                    <span style={{
                      fontFamily: 'monospace',
                      fontWeight: 800,
                      color: 'var(--lime-400)',
                      fontSize: '1rem',
                      letterSpacing: '0.05em',
                    }}>
                      {b.bookingReference}
                    </span>
                    <span className={`badge ${isConfirmed ? 'badge-confirmed' : 'badge-cancelled'}`}>
                      {b.status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    {venue?.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <MapPin size={14} color="var(--emerald-400)" />
                    <span>{venue?.address}</span>
                  </div>
                </div>

                {/* Date & Time Slot */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>
                    <Calendar size={16} color="var(--emerald-400)" />
                    <span>{b.bookingDate}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.9rem', color: 'var(--lime-400)', fontWeight: 700 }}>
                    <Clock size={16} color="var(--lime-400)" />
                    <span>{b.slotLabel} IST</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.15rem' }}>
                    ₹{b.amount?.toLocaleString('en-IN')} (Pay at Venue)
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link
                    to={`/bookings/${b._id}/ticket`}
                    className="btn btn-secondary"
                    style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', gap: '0.35rem' }}
                  >
                    <Ticket size={16} /> View Ticket
                  </Link>

                  {canCancel && (
                    <button
                      onClick={() => handleOpenCancelModal(b)}
                      className="btn btn-danger"
                      style={{ padding: '0.55rem 0.95rem', fontSize: '0.85rem', gap: '0.35rem' }}
                    >
                      <Ban size={16} /> Cancel Slot
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Dialog */}
      <CancellationModal
        booking={selectedBookingToCancel}
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirmCancel={handleConfirmCancel}
        loading={cancelLoading}
      />
    </div>
  );
}
