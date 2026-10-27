const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validation');

// All booking operations require authenticated session
router.use(protect);

router.post('/', createBooking);
router.get('/my', getMyBookings);
router.get('/:id', validateObjectId('id'), getBookingById);
router.put('/:id/cancel', validateObjectId('id'), cancelBooking);

module.exports = router;
