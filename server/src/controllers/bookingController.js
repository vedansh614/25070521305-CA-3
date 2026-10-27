const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const { broadcastSlotUpdate } = require('../config/socket');
const {
  getRollingDates,
  createSlotInstant,
} = require('../utils/dateUtils');

// Helper to parse hour from slotLabel e.g. "06:00 - 07:00" -> 6
function parseStartHourFromLabel(slotLabel) {
  if (!slotLabel || typeof slotLabel !== 'string') return null;
  const match = slotLabel.match(/^(\d{2}):00/);
  return match ? parseInt(match[1], 10) : null;
}

// Generate unique booking reference: PA-YYYYMMDD-XXXX
function generateBookingReference(dateString) {
  const cleanDate = dateString.replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PA-${cleanDate}-${randomSuffix}`;
}

// @desc    Create a new slot booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { venueId, bookingDate, slotLabel, idempotencyKey } = req.body;

    if (!venueId || !bookingDate || !slotLabel) {
      return res.status(400).json({
        success: false,
        message: 'venueId, bookingDate, and slotLabel are required to reserve a slot.',
      });
    }

    // Safe retry / idempotency check
    if (idempotencyKey) {
      const existingKeyBooking = await Booking.findOne({
        user: req.user._id,
        idempotencyKey,
      }).populate('venue');

      if (existingKeyBooking) {
        return res.status(200).json({
          success: true,
          isDuplicateSubmission: true,
          message: 'Booking retrieved from existing submission.',
          booking: existingKeyBooking,
        });
      }
    }

    // 1. Fetch Venue
    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Selected venue does not exist.',
      });
    }

    if (!venue.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This venue is currently inactive and cannot accept bookings.',
      });
    }

    // 2. Validate bookingDate within rolling 14-day window
    const allowedDates = getRollingDates(14);
    if (!allowedDates.includes(bookingDate)) {
      return res.status(400).json({
        success: false,
        message: `Booking date ${bookingDate} is outside the allowed 14-day reservation window.`,
      });
    }

    // 3. Parse and validate hour
    const startHour = parseStartHourFromLabel(slotLabel);
    if (startHour === null) {
      return res.status(400).json({
        success: false,
        message: 'Invalid slot label format. Expected format "HH:00 - HH:00".',
      });
    }

    const openHour = venue.openingHours?.open ?? 6;
    const closeHour = venue.openingHours?.close ?? 23;
    if (startHour < openHour || startHour >= closeHour) {
      return res.status(400).json({
        success: false,
        message: `Requested slot is outside venue operating hours (${openHour}:00 - ${closeHour}:00).`,
      });
    }

    // 4. Calculate UTC instants
    const startTime = createSlotInstant(bookingDate, startHour);
    const endTime = createSlotInstant(bookingDate, startHour + 1);

    // 5. Ensure slot is in the future
    if (startTime.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a time slot in the past. Please select an upcoming slot.',
      });
    }

    // 6. Generate snapshot and reference
    let bookingReference = generateBookingReference(bookingDate);
    // Ensure uniqueness of reference
    let isUniqueRef = false;
    while (!isUniqueRef) {
      const existing = await Booking.findOne({ bookingReference });
      if (!existing) {
        isUniqueRef = true;
      } else {
        bookingReference = generateBookingReference(bookingDate);
      }
    }

    // 7. Atomic Insert into MongoDB:
    // The compound unique partial index { venue: 1, startTime: 1 } (status: 'CONFIRMED')
    // enforces at the database level that exactly one booking can succeed for this slot.
    try {
      const booking = await Booking.create({
        bookingReference,
        user: req.user._id,
        venue: venue._id,
        venueSnapshot: {
          name: venue.name,
          sport: venue.sport,
          city: venue.city,
          address: venue.address,
          pricePerHour: venue.pricePerHour,
        },
        bookingDate,
        startTime,
        endTime,
        slotLabel,
        amount: venue.pricePerHour, // Calculated strictly on server
        paymentMethod: 'PAY_AT_VENUE',
        status: 'CONFIRMED',
        idempotencyKey: idempotencyKey || undefined,
      });

      // 8. Broadcast real-time availability update only after database write succeeds
      broadcastSlotUpdate({
        venueId: venue._id,
        bookingDate,
        slotLabel,
        startTime,
        status: 'BOOKED',
      });

      return res.status(201).json({
        success: true,
        message: 'Your slot has been reserved successfully! Please pay at venue.',
        booking,
      });
    } catch (insertError) {
      // Catch MongoDB unique index collision (E11000)
      if (insertError.code === 11000) {
        return res.status(409).json({
          success: false,
          code: 'SLOT_CONFLICT',
          message: 'This slot was just confirmed by another player. Please choose another time slot.',
        });
      }
      throw insertError;
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for the logged-in user
// @route   GET /api/bookings/my
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('venue', 'name sport city address images')
      .sort({ startTime: -1 });

    const now = new Date();

    const formatted = bookings.map((b) => {
      const isPast = b.startTime.getTime() <= now.getTime();
      let category = 'UPCOMING';
      if (b.status === 'CANCELLED') {
        category = 'CANCELLED';
      } else if (isPast) {
        category = 'PAST';
      }

      return {
        ...b.toObject(),
        category,
        isPast,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      bookings: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking details / ticket by ID
// @route   GET /api/bookings/:id
// @access  Private (Owner or Admin only)
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('venue')
      .populate('user', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Access control: strictly booking owner or admin
    const isOwner = booking.user._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You do not have permission to view this booking ticket.',
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an upcoming booking and release slot
// @route   PUT /api/bookings/:id/cancel
// @access  Private (Owner or Admin)
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found.',
      });
    }

    // Check ownership
    const isOwner = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You cannot cancel another user’s booking.',
      });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'This booking is already cancelled.',
      });
    }

    // Cannot cancel past bookings
    if (booking.startTime.getTime() <= Date.now()) {
      return res.status(400).json({
        success: false,
        message: 'Past or currently ongoing bookings cannot be cancelled.',
      });
    }

    booking.status = 'CANCELLED';
    booking.cancelledAt = new Date();
    booking.cancellationReason = req.body.reason || (isAdmin ? 'Cancelled by administrator' : 'Cancelled by customer');
    await booking.save();

    // Broadcast real-time slot release
    broadcastSlotUpdate({
      venueId: booking.venue,
      bookingDate: booking.bookingDate,
      slotLabel: booking.slotLabel,
      startTime: booking.startTime,
      status: 'AVAILABLE',
    });

    return res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. The slot has been released for other players.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
