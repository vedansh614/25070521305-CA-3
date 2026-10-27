const Venue = require('../models/Venue');
const Booking = require('../models/Booking');
const {
  getKolkataDateString,
  getRollingDates,
  createSlotInstant,
  formatSlotLabel,
} = require('../utils/dateUtils');

// @desc    Get all venues with search, filters, and sorting
// @route   GET /api/venues
// @access  Public
const getVenues = async (req, res, next) => {
  try {
    const {
      search,
      city,
      sport,
      maxPrice,
      sortBy,
      includeInactive,
    } = req.query;

    const filter = {};

    // Only include active venues unless specifically requested by admin
    if (!includeInactive || includeInactive !== 'true') {
      filter.isActive = true;
    }

    if (city && ['Nagpur', 'Pune', 'Mumbai'].includes(city)) {
      filter.city = city;
    }

    if (sport && ['cricket', 'football', 'badminton', 'basketball'].includes(sport.toLowerCase())) {
      filter.sport = sport.toLowerCase();
    }

    if (maxPrice && !isNaN(Number(maxPrice))) {
      filter.pricePerHour = { $lte: Number(maxPrice) };
    }

    if (search && search.trim() !== '') {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sortBy === 'price_asc') {
      sortOptions = { pricePerHour: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { pricePerHour: -1 };
    } else if (sortBy === 'name_asc') {
      sortOptions = { name: 1 };
    }

    const venues = await Venue.find(filter).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: venues.length,
      venues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured venues for homepage
// @route   GET /api/venues/featured
// @access  Public
const getFeaturedVenues = async (req, res, next) => {
  try {
    const venues = await Venue.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(4);

    return res.status(200).json({
      success: true,
      venues,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single venue by ID
// @route   GET /api/venues/:id
// @access  Public
const getVenueById = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    return res.status(200).json({
      success: true,
      venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get slot availability for a venue on a given date (Asia/Kolkata timezone)
// @route   GET /api/venues/:id/slots?date=YYYY-MM-DD
// @access  Public
const getVenueSlots = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    // Default to current date in Asia/Kolkata if not provided
    const requestedDate = req.query.date || getKolkataDateString();

    // Validate 14-day rolling window
    const allowedDates = getRollingDates(14);
    if (!allowedDates.includes(requestedDate)) {
      return res.status(400).json({
        success: false,
        message: `Date ${requestedDate} is outside the allowed 14-day booking window.`,
        allowedDates,
      });
    }

    // Fetch confirmed bookings for this venue on this date
    const confirmedBookings = await Booking.find({
      venue: venue._id,
      bookingDate: requestedDate,
      status: 'CONFIRMED',
    }).select('startTime slotLabel');

    // Set of booked startTimes in UTC ISO string
    const bookedTimeStrings = new Set(
      confirmedBookings.map((b) => b.startTime.toISOString())
    );

    const openHour = venue.openingHours?.open ?? 6;
    const closeHour = venue.openingHours?.close ?? 23;
    const now = new Date();

    const slots = [];
    for (let h = openHour; h < closeHour; h++) {
      const slotStart = createSlotInstant(requestedDate, h);
      const slotEnd = createSlotInstant(requestedDate, h + 1);
      const slotLabel = formatSlotLabel(h);
      const isPast = slotStart.getTime() <= now.getTime();
      const isBooked = bookedTimeStrings.has(slotStart.toISOString());

      let status = 'AVAILABLE';
      if (isPast) {
        status = 'PAST';
      } else if (isBooked) {
        status = 'BOOKED';
      }

      slots.push({
        hour: h,
        slotLabel,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        status, // 'AVAILABLE' | 'BOOKED' | 'PAST'
        isAvailable: status === 'AVAILABLE',
        isBooked,
        isPast,
      });
    }

    return res.status(200).json({
      success: true,
      venueId: venue._id,
      venueName: venue.name,
      pricePerHour: venue.pricePerHour,
      isActive: venue.isActive,
      date: requestedDate,
      allowedDates,
      slots,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Create new venue
// @route   POST /api/venues
// @access  Private (Admin only)
const adminCreateVenue = async (req, res, next) => {
  try {
    const {
      name,
      sport,
      city,
      address,
      description,
      images,
      amenities,
      openingHours,
      pricePerHour,
      isActive,
    } = req.body;

    const venue = await Venue.create({
      name,
      sport,
      city,
      address,
      description,
      images,
      amenities,
      openingHours,
      pricePerHour,
      isActive: isActive !== undefined ? isActive : true,
    });

    return res.status(201).json({
      success: true,
      message: 'Venue created successfully.',
      venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Update venue details
// @route   PUT /api/venues/:id
// @access  Private (Admin only)
const adminUpdateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    const updatableFields = [
      'name',
      'sport',
      'city',
      'address',
      'description',
      'images',
      'amenities',
      'openingHours',
      'pricePerHour',
      'isActive',
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        venue[field] = req.body[field];
      }
    });

    await venue.save();

    return res.status(200).json({
      success: true,
      message: 'Venue updated successfully.',
      venue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: Delete or deactivate venue safely
// @route   DELETE /api/venues/:id
// @access  Private (Admin only)
const adminDeleteOrDeactivateVenue = async (req, res, next) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) {
      return res.status(404).json({
        success: false,
        message: 'Venue not found.',
      });
    }

    // Check if venue has ANY booking history
    const bookingCount = await Booking.countDocuments({ venue: venue._id });

    if (bookingCount > 0) {
      // Deactivate instead of hard delete to preserve historical integrity
      venue.isActive = false;
      await venue.save();

      return res.status(200).json({
        success: true,
        action: 'DEACTIVATED',
        message: `Venue has ${bookingCount} historical booking record(s) and was safely deactivated. It will no longer accept new bookings.`,
        venue,
      });
    }

    // If zero booking history, permanent deletion is safe
    await Venue.findByIdAndDelete(venue._id);

    return res.status(200).json({
      success: true,
      action: 'DELETED',
      message: 'Venue had no booking history and has been permanently removed.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getVenues,
  getFeaturedVenues,
  getVenueById,
  getVenueSlots,
  adminCreateVenue,
  adminUpdateVenue,
  adminDeleteOrDeactivateVenue,
};
