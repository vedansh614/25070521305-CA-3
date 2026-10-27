import React, { useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Info, Zap } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

// Helper to format date strings: "2026-10-27" -> { dayName: 'Tue', dateNum: '27', monthName: 'Oct' }
function formatDatePill(dateStr) {
  // Use explicit parts to avoid local timezone drift
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
  const monthName = dateObj.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
  return { dayName, dateNum: String(d).padStart(2, '0'), monthName };
}

export default function SlotPicker({
  venueId,
  selectedDate,
  onDateChange,
  allowedDates = [],
  slots = [],
  selectedSlot,
  onSlotSelect,
  loading = false,
  onRefreshSlots,
}) {
  const { socket } = useSocket();

  // Listen to real-time availability updates for this venue
  useEffect(() => {
    if (!socket || !venueId) return;

    socket.emit('join_venue', { venueId });

    const handleUpdate = (data) => {
      if (data.venueId === venueId && data.bookingDate === selectedDate) {
        if (onRefreshSlots) {
          onRefreshSlots();
        }
      }
    };

    socket.on('availability_update', handleUpdate);
    socket.on('global_availability_update', handleUpdate);

    return () => {
      socket.emit('leave_venue', { venueId });
      socket.off('availability_update', handleUpdate);
      socket.off('global_availability_update', handleUpdate);
    };
  }, [socket, venueId, selectedDate, onRefreshSlots]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Date Selection Header & 14-Day Horizon Pill Carousel */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
            <Calendar size={18} color="var(--emerald-400)" />
            <span>Select Date (Rolling 14-Day Schedule)</span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Times displayed in IST (UTC+05:30)
          </span>
        </div>

        {/* Date Pills Horizon */}
        <div style={{
          display: 'flex',
          gap: '0.65rem',
          overflowX: 'auto',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'thin',
        }}>
          {allowedDates.map((dateStr, idx) => {
            const isSelected = dateStr === selectedDate;
            const { dayName, dateNum, monthName } = formatDatePill(dateStr);
            const isToday = idx === 0;

            return (
              <button
                key={dateStr}
                onClick={() => onDateChange(dateStr)}
                style={{
                  minWidth: '78px',
                  padding: '0.75rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isSelected ? 'var(--emerald-500)' : 'var(--bg-card)',
                  color: isSelected ? '#04121e' : 'var(--text-main)',
                  border: isSelected ? '1px solid var(--emerald-400)' : '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.2rem',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                  boxShadow: isSelected ? '0 0 14px rgba(16, 185, 129, 0.35)' : 'none',
                }}
              >
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isSelected ? '#04121e' : (isToday ? 'var(--lime-400)' : 'var(--text-dim)'),
                }}>
                  {isToday ? 'Today' : dayName}
                </span>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>
                  {dateNum}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                  {monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend & Slot Status Guide */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '1.25rem',
        padding: '0.65rem 1rem',
        backgroundColor: 'rgba(12, 26, 45, 0.6)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        fontSize: '0.8rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#10b981' }}></span>
          <span>Available</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--lime-400)' }}></span>
          <span>Selected for Review</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#ef4444' }}></span>
          <span>Booked by Another Player</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#334155' }}></span>
          <span>Past Slot</span>
        </div>
      </div>

      {/* Slot Selection Grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.05rem' }}>
            <Clock size={18} color="var(--emerald-400)" />
            <span>Available 1-Hour Time Slots</span>
          </div>
          {loading && (
            <span style={{ fontSize: '0.8rem', color: 'var(--lime-400)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Zap size={14} /> Syncing live availability...
            </span>
          )}
        </div>

        {slots.length === 0 ? (
          <div style={{
            padding: '2.5rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)',
          }}>
            No operational slots configured for this date.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem',
          }}>
            {slots.map((slot) => {
              const isSelected = selectedSlot?.slotLabel === slot.slotLabel;
              const isAvailable = slot.isAvailable;
              const isBooked = slot.isBooked;
              const isPast = slot.isPast;

              let bgColor = 'var(--bg-card)';
              let borderColor = 'var(--border-subtle)';
              let textColor = 'var(--text-main)';
              let statusLabel = 'Available';
              let cursor = 'pointer';

              if (isSelected) {
                bgColor = 'rgba(163, 230, 53, 0.15)';
                borderColor = 'var(--lime-400)';
                textColor = 'var(--lime-400)';
                statusLabel = 'Selected';
              } else if (isBooked) {
                bgColor = 'rgba(239, 68, 68, 0.08)';
                borderColor = 'rgba(239, 68, 68, 0.25)';
                textColor = '#f87171';
                statusLabel = 'Booked';
                cursor = 'not-allowed';
              } else if (isPast) {
                bgColor = 'rgba(30, 41, 59, 0.4)';
                borderColor = 'transparent';
                textColor = '#64748b';
                statusLabel = 'Passed';
                cursor = 'not-allowed';
              } else {
                // Available
                borderColor = 'rgba(16, 185, 129, 0.35)';
              }

              return (
                <button
                  key={slot.slotLabel}
                  disabled={!isAvailable}
                  onClick={() => onSlotSelect(slot)}
                  style={{
                    padding: '0.85rem 0.6rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: bgColor,
                    border: `1px solid ${borderColor}`,
                    color: textColor,
                    cursor,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.25rem',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 0 14px rgba(163, 230, 53, 0.3)' : 'none',
                    transform: isSelected ? 'scale(1.02)' : 'none',
                  }}
                  title={
                    isBooked
                      ? 'Already booked by another player'
                      : isPast
                      ? 'This hour has passed'
                      : `Click to select slot ${slot.slotLabel}`
                  }
                >
                  <span style={{ fontWeight: 700, fontSize: '0.925rem' }}>
                    {slot.slotLabel}
                  </span>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    opacity: 0.9,
                  }}>
                    {statusLabel}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Helpful Clarification Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.65rem',
        padding: '0.85rem 1rem',
        backgroundColor: 'rgba(16, 185, 129, 0.07)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        fontSize: '0.825rem',
        color: 'var(--text-muted)',
      }}>
        <Info size={16} color="var(--emerald-400)" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          Selecting a slot above prepares your booking review. Your slot is officially locked and reserved only after you confirm your details on the next step.
        </div>
      </div>
    </div>
  );
}
