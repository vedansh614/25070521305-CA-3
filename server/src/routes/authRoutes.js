const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  getMe,
  updateProfile,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/logout', logout);

module.exports = router;
