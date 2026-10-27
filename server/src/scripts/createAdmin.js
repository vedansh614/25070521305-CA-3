require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function createAdmin() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playarena';
  const name = process.env.ADMIN_NAME || 'PlayArena Administrator';
  const email = process.env.ADMIN_EMAIL || 'admin@playarena.local';
  const password = process.env.ADMIN_PASSWORD || 'AdminSecure@2026';

  if (!email || !password) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD must be configured.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('[Admin Setup] Connected to MongoDB.');

    const normalizedEmail = email.toLowerCase().trim();
    let adminUser = await User.findOne({ email: normalizedEmail });

    if (adminUser) {
      adminUser.role = 'ADMIN';
      adminUser.name = name;
      adminUser.password = password; // Will be hashed by pre('save') hook
      await adminUser.save();
      console.log(`[Admin Setup] Existing account for ${normalizedEmail} upgraded to ADMIN.`);
    } else {
      adminUser = await User.create({
        name,
        email: normalizedEmail,
        password,
        role: 'ADMIN',
      });
      console.log(`[Admin Setup] New administrator account created for ${normalizedEmail}.`);
    }

    console.log(`Admin ID: ${adminUser._id}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log('Admin account ready for local evaluation and viva demonstration.');
    process.exit(0);
  } catch (error) {
    console.error('[Admin Setup Error] Failed to configure administrator account:', error);
    process.exit(1);
  }
}

createAdmin();
