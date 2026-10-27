const mongoose = require('mongoose');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playarena';

  try {
    const conn = await mongoose.connect(mongoUri, {
      autoIndex: true, // Automatically build indexes defined in schemas
    });
    isConnected = true;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);

    // Migrate any legacy booking documents before enforcing index constraints
    const bookingsColl = mongoose.connection.collection('bookings');
    const legacyBookings = await bookingsColl.find({ startTime: null }).toArray();
    if (legacyBookings.length > 0) {
      const { createSlotInstant, formatSlotLabel } = require('../utils/dateUtils');
      for (const b of legacyBookings) {
        const bookingDate = b.bookingDate || '2026-10-27';
        let hour = b.startHour;
        if (hour === undefined || hour === null) {
          if (b.timeSlot) {
            const match = b.timeSlot.match(/^(\d{2}):00/);
            if (match) hour = parseInt(match[1], 10);
          }
        }
        if (hour === undefined || hour === null) hour = 6;
        const startTime = createSlotInstant(bookingDate, hour);
        const endTime = createSlotInstant(bookingDate, hour + 1);
        const slotLabel = b.timeSlot || formatSlotLabel(hour);
        const amount = b.price || b.amount || 1000;
        await bookingsColl.updateOne(
          { _id: b._id },
          {
            $set: {
              startTime,
              endTime,
              slotLabel,
              amount,
              'venueSnapshot.pricePerHour': b.venueSnapshot?.pricePerHour || b.venueSnapshot?.hourlyPrice || amount,
            },
          }
        );
      }
      console.log(`[Database] Auto-migrated ${legacyBookings.length} legacy booking documents.`);
    }

    // Ensure models are registered and indexes are synced
    const Booking = require('../models/Booking');
    const User = require('../models/User');
    const Venue = require('../models/Venue');

    await Promise.all([
      Booking.syncIndexes(),
      User.syncIndexes(),
      Venue.syncIndexes(),
    ]);

    console.log('[Database] Mongoose indexes verified and synchronized successfully.');
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    throw error;
  }
}

function isDbHealthy() {
  return mongoose.connection.readyState === 1;
}

module.exports = {
  connectDB,
  isDbHealthy,
};
