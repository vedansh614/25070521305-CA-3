const express = require('express');
const router = express.Router();
const {
  adminGetStats,
  adminGetAllBookings,
  adminGetAllUsers,
} = require('../controllers/adminController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

// All admin routes require authentication and admin role
router.use(protect, requireAdmin);

router.get('/stats', adminGetStats);
router.get('/bookings', adminGetAllBookings);
router.get('/users', adminGetAllUsers);

module.exports = router;
