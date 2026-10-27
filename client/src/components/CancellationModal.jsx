import React, { useState } from 'react';
import { AlertTriangle, X, Check } from 'lucide-react';

export default function CancellationModal({
  booking,
  isOpen,
  onClose,
  onConfirmCancel,
  loading = false,
}) {
  const [reason, setReason] = useState('Change of schedule');

  if (!isOpen || !booking) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmCancel(booking._id, reason);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '480px',
        width: '100%',
        padding: '1.75rem',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--danger-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Cancel Slot Reservation
            </h3>
          </div>
          <button onClick={onClose} disabled={loading} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, marginBottom: '1rem' }}>
          Are you sure you want to cancel booking <strong>{booking.bookingReference}</strong> for <strong>{booking.venue?.name || booking.venueSnapshot?.name}</strong> on <strong>{booking.bookingDate} ({booking.slotLabel})</strong>?
        </p>

        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem 1rem',
          fontSize: '0.8rem',
          color: '#fca5a5',
          marginBottom: '1.25rem',
        }}>
          <strong>Important:</strong> This will cancel your reservation and immediately release the slot in the database so other players can book it. This booking will be marked as Cancelled in your history.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Reason for cancellation (optional):</label>
            <select
              className="form-select"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={loading}
            >
              <option value="Change of personal schedule">Change of personal schedule</option>
              <option value="Inclement weather / Rain forecast">Inclement weather / Rain forecast</option>
              <option value="Player group cancelled">Player group cancelled</option>
              <option value="Accidental / duplicate booking">Accidental / duplicate booking</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Keep My Slot
            </button>
            <button
              type="submit"
              className="btn btn-danger"
              disabled={loading}
            >
              {loading ? 'Releasing Slot...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
