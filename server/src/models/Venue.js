const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Venue name is required'],
      trim: true,
      maxlength: [100, 'Venue name cannot exceed 100 characters'],
    },
    sport: {
      type: String,
      required: [true, 'Sport category is required'],
      enum: {
        values: ['cricket', 'football', 'badminton', 'basketball'],
        message: '{VALUE} is not a supported sport',
      },
      lowercase: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: {
        values: ['Nagpur', 'Pune', 'Mumbai'],
        message: '{VALUE} is not in our supported cities (Nagpur, Pune, Mumbai)',
      },
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A venue must have at least one image',
      },
    },
    amenities: {
      type: [String],
      default: ['Floodlights', 'Changing Rooms', 'Drinking Water', 'Parking'],
    },
    openingHours: {
      open: {
        type: Number,
        default: 6, // 06:00 AM
        min: 0,
        max: 23,
      },
      close: {
        type: Number,
        default: 23, // 11:00 PM (23:00)
        min: 1,
        max: 24,
      },
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Price per hour in INR is required'],
      min: [50, 'Price must be at least ₹50 per hour'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast searching and filtering
venueSchema.index({ city: 1, sport: 1, isActive: 1 });
venueSchema.index({ name: 'text', description: 'text', address: 'text' });

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;
