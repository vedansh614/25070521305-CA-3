const User = require('../models/User');
const Venue = require('../models/Venue');
const Booking = require('../models/Booking');

// @desc    Get real database stats for admin dashboard
// @route   GET /api/admin/stats
// @access  Private (Admin only)
const adminGetStats = async (req, res, next) => {
  try {
    const now = new Date();

    const [
      totalUsers,
      totalVenues,
      activeVenues,
      totalBookings,
      confirmedBookings,
      upcomingBookings,
      cancelledBookings,
      revenueAggregate,
    ] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      Venue.countDocuments(),
      Venue.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'CONFIRMED' }),
      Booking.countDocuments({ status: 'CONFIRMED', startTime: { $gt: now } }),
      Booking.countDocuments({ status: 'CANCELLED' }),
      // Calculate total expected cash collection from confirmed bookings
      Booking.aggregate([
        { $match: { status: 'CONFIRMED' } },
        { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
      ]),
    ]);

    const expectedPayAtVenueVolume =
      revenueAggregate.length > 0 ? revenueAggregate[0].totalAmount : 0;

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalVenues,
        activeVenues,
        inactiveVenues: totalVenues - activeVenues,
        totalBookings,
        confirmedBookings,
        upcomingBookings,
        completedBookings: confirmedBookings - upcomingBookings,
        cancelledBookings,
        expectedPayAtVenueVolume, // Explicitly labeled as expected pay-at-venue
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with filters for admin
// @route   GET /api/admin/bookings
// @access  Private (Admin only)
const adminGetAllBookings = async (req, res, next) => {
  try {
    const { status, venueId, date, search } = req.query;
    const filter = {};

    if (status && ['CONFIRMED', 'CANCELLED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    if (venueId) {
      filter.venue = venueId;
    }

    if (date) {
      filter.bookingDate = date;
    }

    let bookings = await Booking.find(filter)
      .populate('venue', 'name sport city address')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      bookings = bookings.filter((b) => {
        const refMatch = b.bookingReference?.toLowerCase().includes(q);
        const userMatch = b.user?.name?.toLowerCase().includes(q) || b.user?.email?.toLowerCase().includes(q);
        const venueMatch = b.venue?.name?.toLowerCase().includes(q) || b.venueSnapshot?.name?.toLowerCase().includes(q);
        return refMatch || userMatch || venueMatch;
      });
    }

    return res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered users for admin review
// @route   GET /api/admin/users
// @access  Private (Admin only)
const adminGetAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminGetStats,
  adminGetAllBookings,
  adminGetAllUsers,
};
