const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingReference: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    venue: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
    },
    // Snapshot of venue at time of booking to preserve historical accuracy
    venueSnapshot: {
      name: { type: String, required: true },
      sport: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      pricePerHour: { type: Number, required: true },
    },
    bookingDate: {
      type: String, // Format: YYYY-MM-DD (Asia/Kolkata calendar day)
      required: true,
    },
    startTime: {
      type: Date, // Instant in UTC
      required: true,
    },
    endTime: {
      type: Date, // Instant in UTC (exactly 1 hour after startTime)
      required: true,
    },
    slotLabel: {
      type: String, // e.g. "06:00 - 07:00" or "18:00 - 19:00"
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      default: 'PAY_AT_VENUE',
      enum: ['PAY_AT_VENUE'],
    },
    status: {
      type: String,
      enum: ['CONFIRMED', 'CANCELLED'],
      default: 'CONFIRMED',
    },
    cancelledAt: {
      type: Date,
    },
    cancellationReason: {
      type: String,
      default: 'Cancelled by user',
    },
    idempotencyKey: {
      type: String,
      index: true,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// CRITICAL CONCURRENCY SAFEGUARD:
// Partial unique index ensures that for any venue, there can be at most ONE 'CONFIRMED' booking
// for a given startTime instant. If two concurrent requests attempt to book the exact same slot,
// MongoDB atomically rejects the second one with duplicate key error E11000.
// When a booking is CANCELLED, it no longer matches the filter expression { status: 'CONFIRMED' },
// releasing the slot immediately for other players!
bookingSchema.index(
  { venue: 1, startTime: 1 },
  {
    unique: true,
    partialFilterExpression: { status: 'CONFIRMED' },
    name: 'unique_active_venue_slot',
  }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ venue: 1, bookingDate: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
