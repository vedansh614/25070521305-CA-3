const express = require('express');
const router = express.Router();
const {
  getVenues,
  getFeaturedVenues,
  getVenueById,
  getVenueSlots,
  adminCreateVenue,
  adminUpdateVenue,
  adminDeleteOrDeactivateVenue,
} = require('../controllers/venueController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const { validateObjectId } = require('../middleware/validation');

// Public routes
router.get('/', getVenues);
router.get('/featured', getFeaturedVenues);
router.get('/:id', validateObjectId('id'), getVenueById);
router.get('/:id/slots', validateObjectId('id'), getVenueSlots);
router.get('/:id/availability', validateObjectId('id'), getVenueSlots);

// Admin routes
router.post('/', protect, requireAdmin, adminCreateVenue);
router.put('/:id', protect, requireAdmin, validateObjectId('id'), adminUpdateVenue);
router.delete('/:id', protect, requireAdmin, validateObjectId('id'), adminDeleteOrDeactivateVenue);

module.exports = router;
