require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('../models/Venue');

// Distinct verified image mappings for all 18 venues across Nagpur, Pune, and Mumbai
const venueImageMappings = {
  // --- CRICKET VENUES ---
  'GreenField Box Cricket Turf': [
    '/images/venues/cricket-turf-01.jpg',
    '/images/venues/cricket-turf-02.jpg',
    '/images/venues/cricket-turf-03.jpg',
  ],
  'Orange City Turf & Box Cricket Arena': [
    '/images/venues/cricket-turf-02.jpg',
    '/images/venues/cricket-turf-01.jpg',
    '/images/venues/cricket-turf-04.jpg',
  ],
  'Shivaji Park Box Cricket & Practice Pitch': [
    '/images/venues/cricket-turf-03.jpg',
    '/images/venues/cricket-turf-01.jpg',
    '/images/venues/cricket-turf-05.jpg',
  ],
  'Kothrud Strikers Cricket Hub': [
    '/images/venues/cricket-turf-04.jpg',
    '/images/venues/cricket-turf-02.jpg',
    '/images/venues/cricket-turf-01.jpg',
  ],
  'Andheri West Champions Turf': [
    '/images/venues/cricket-turf-05.jpg',
    '/images/venues/cricket-turf-03.jpg',
    '/images/venues/cricket-turf-01.jpg',
  ],

  // --- FOOTBALL VENUES ---
  'Apex Arena Football Turf': [
    '/images/venues/football-turf-01.jpg',
    '/images/venues/football-turf-02.jpg',
    '/images/venues/football-turf-03.jpg',
  ],
  'Deccan Thunder 7v7 Football Arena': [
    '/images/venues/football-turf-02.jpg',
    '/images/venues/football-turf-01.jpg',
    '/images/venues/football-turf-04.jpg',
  ],
  'Orange City Futsal & Multi-Turf': [
    '/images/venues/football-turf-03.jpg',
    '/images/venues/football-turf-01.jpg',
    '/images/venues/football-turf-02.jpg',
  ],
  'Futala Lake Super Turf': [
    '/images/venues/football-turf-04.jpg',
    '/images/venues/football-turf-03.jpg',
    '/images/venues/football-turf-01.jpg',
  ],

  // --- BADMINTON VENUES ---
  'SmashPoint International Badminton Hub': [
    '/images/venues/badminton-court-01.jpg',
    '/images/venues/badminton-court-02.jpg',
    '/images/venues/badminton-court-03.jpg',
  ],
  'Viman Nagar Indoor Badminton Academy': [
    '/images/venues/badminton-court-02.jpg',
    '/images/venues/badminton-court-01.jpg',
    '/images/venues/badminton-court-04.jpg',
  ],
  'Marine Drive Smash Badminton Academy': [
    '/images/venues/badminton-court-03.jpg',
    '/images/venues/badminton-court-01.jpg',
    '/images/venues/badminton-court-02.jpg',
  ],
  'Koregaon Park Shuttle Point': [
    '/images/venues/badminton-court-04.jpg',
    '/images/venues/badminton-court-02.jpg',
    '/images/venues/badminton-court-05.jpg',
  ],
  'Dharampeth Sports Pavilion Badminton': [
    '/images/venues/badminton-court-05.jpg',
    '/images/venues/badminton-court-01.jpg',
    '/images/venues/badminton-court-03.jpg',
  ],

  // --- BASKETBALL VENUES ---
  'Hoops Urban Basketball Arena': [
    '/images/venues/basketball-court-01.jpg',
    '/images/venues/basketball-court-02.jpg',
    '/images/venues/basketball-court-03.jpg',
  ],
  'Marine Lines Sky Court Basketball': [
    '/images/venues/basketball-court-02.jpg',
    '/images/venues/basketball-court-01.jpg',
    '/images/venues/basketball-court-04.jpg',
  ],
  'Bandra Hoops Downtown Basketball Court': [
    '/images/venues/basketball-court-03.jpg',
    '/images/venues/basketball-court-01.jpg',
    '/images/venues/basketball-court-02.jpg',
  ],
  'Dharampeth Slam Dunk Arena': [
    '/images/venues/basketball-court-04.jpg',
    '/images/venues/basketball-court-02.jpg',
    '/images/venues/basketball-court-01.jpg',
  ],
};

async function updateVenueImages() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playarena';
  await mongoose.connect(mongoUri);
  console.log('[Image Update] Connected to MongoDB.');

  const venues = await Venue.find();
  console.log(`[Image Update] Found ${venues.length} venues in database.`);

  let updatedCount = 0;
  for (const v of venues) {
    const newImages = venueImageMappings[v.name];
    if (newImages && newImages.length > 0) {
      v.images = newImages;
      await v.save();
      console.log(`[UPDATED] ${v.name} (${v.sport} - ${v.city}) -> Cover: ${newImages[0]}`);
      updatedCount++;
    } else {
      // Fallback matching by sport if name slightly different
      const sportDefaults = {
        cricket: ['/images/venues/cricket-turf-01.jpg', '/images/venues/cricket-turf-02.jpg'],
        football: ['/images/venues/football-turf-01.jpg', '/images/venues/football-turf-02.jpg'],
        badminton: ['/images/venues/badminton-court-01.jpg', '/images/venues/badminton-court-02.jpg'],
        basketball: ['/images/venues/basketball-court-01.jpg', '/images/venues/basketball-court-02.jpg'],
      };
      const fallbackImgs = sportDefaults[v.sport.toLowerCase()] || ['/images/fallbacks/default.svg'];
      v.images = fallbackImgs;
      await v.save();
      console.log(`[FALLBACK UPDATED] ${v.name} (${v.sport}) -> Cover: ${fallbackImgs[0]}`);
      updatedCount++;
    }
  }

  console.log(`\n[Image Update Complete] Successfully updated ${updatedCount} venues with verified sport images.`);
  process.exit(0);
}

updateVenueImages();
