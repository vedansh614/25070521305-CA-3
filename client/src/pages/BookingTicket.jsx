import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Trophy,
  Printer,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  ArrowRight,
} from 'lucide-react';

export default function BookingTicket() {
  const { id } = useParams();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadTicket() {
      try {
        const res = await api.get(`/api/bookings/${id}`);
        if (res && res.booking) {
          setBooking(res.booking);
        }
      } catch (err) {
        setError(err.message || 'Unable to load booking ticket.');
      } finally {
        setLoading(false);
      }
    }
    loadTicket();
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Retrieving your official ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', maxWidth: '500px' }}>
        <AlertCircle size={40} color="var(--danger)" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Ticket Inaccessible</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          {error || 'You do not have authorization to view this booking ticket.'}
        </p>
        <Link to="/my-bookings" className="btn btn-primary">
          <ChevronLeft size={16} /> Return to My Bookings
        </Link>
      </div>
    );
  }

  const isConfirmed = booking.status === 'CONFIRMED';
  const venueData = booking.venueSnapshot || booking.venue;

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '720px' }}>
      {/* Top Action Bar (hidden in print) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <Link to="/my-bookings" style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.9rem' }}>
          <ChevronLeft size={16} /> My Bookings
        </Link>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handlePrint}
            className="btn btn-secondary"
            style={{ gap: '0.45rem' }}
          >
            <Printer size={16} /> Print / Save as PDF
          </button>
          <Link to="/venues" className="btn btn-primary" style={{ gap: '0.45rem' }}>
            Book Another Turf <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* PRINTABLE TICKET CARD */}
      <div
        className="printable-ticket"
        style={{
          backgroundColor: 'var(--bg-card)',
          border: '2px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Ticket Header */}
        <div style={{
          backgroundColor: '#0a192f',
          padding: '2rem',
          borderBottom: '2px dashed var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 800 }}>
                PLAY<span style={{ color: 'var(--lime-400)' }}>ARENA</span>
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Official Turf & Court Booking Pass
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Booking Reference
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--lime-400)',
              letterSpacing: '0.08em',
              marginTop: '0.2rem',
            }}>
              {booking.bookingReference}
            </div>
            <div style={{ marginTop: '0.4rem' }}>
              <span className={`badge ${isConfirmed ? 'badge-confirmed' : 'badge-cancelled'}`}>
                {booking.status}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Body */}
        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {/* Venue & Location */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
              Venue & Sport
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {venueData?.name}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.35rem' }}>
              <MapPin size={15} color="var(--emerald-400)" />
              <span>{venueData?.address} ({venueData?.city})</span>
            </div>
          </div>

          {/* Key Details Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                <Calendar size={14} color="var(--emerald-400)" /> Match Date
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>
                {booking.bookingDate}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                <Clock size={14} color="var(--lime-400)" /> Slot Window
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--lime-400)' }}>
                {booking.slotLabel} (IST)
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                Customer Name
              </div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                {booking.user?.name || user?.name}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '0.25rem' }}>
                Amount Payable
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--emerald-400)' }}>
                ₹{booking.amount?.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Payment Method Notice */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.85rem',
          }}>
            <ShieldCheck size={20} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
            <div>
              <strong>Payment Status:</strong> {booking.paymentMethod === 'PAY_AT_VENUE' ? 'Pay At Venue Counter (Cash / UPI)' : booking.paymentMethod}
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                Present this reference upon arrival to confirm court access.
              </div>
            </div>
          </div>

          {/* Cancellation record if cancelled */}
          {booking.status === 'CANCELLED' && (
            <div style={{
              padding: '1rem',
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: '0.85rem',
            }}>
              <strong>Cancellation Note:</strong> Cancelled on{' '}
              {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : 'record'}.
              {booking.cancellationReason && ` Reason: ${booking.cancellationReason}`}
            </div>
          )}

          {/* Footnotes */}
          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
            lineHeight: 1.5,
            borderTop: '1px dashed var(--border-subtle)',
            paddingTop: '1rem',
          }}>
            Continuous Assessment Project CA-03 (PRN: 25070521305). Booking generated dynamically from MongoDB at {new Date(booking.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST.
          </div>
        </div>
      </div>
    </div>
  );
}
