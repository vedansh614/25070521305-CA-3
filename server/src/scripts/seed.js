require('dotenv').config();
const mongoose = require('mongoose');
const Venue = require('../models/Venue');

const demoVenues = [
  {
    name: 'GreenField Box Cricket Turf',
    sport: 'cricket',
    city: 'Nagpur',
    address: 'Near IT Park, Gayatri Nagar, Nagpur - 440022',
    description:
      'Premium FIFA-grade artificial turf box cricket ground equipped with ultra-bright LED floodlights, professional bowling nets, and high-tensile safety netting. Ideal for night matches, corporate tournaments, and weekend friendly games.',
    images: [
      '/images/venues/cricket-turf-01.jpg',
      '/images/venues/cricket-turf-02.jpg',
      '/images/venues/cricket-turf-03.jpg',
    ],
    amenities: [
      'Floodlights',
      'Covered Dugouts',
      'Changing Rooms',
      'Drinking Water',
      'Equipment Rental',
      'Parking',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1100,
    isActive: true,
  },
  {
    name: 'Orange City Turf & Box Cricket Arena',
    sport: 'cricket',
    city: 'Nagpur',
    address: 'Plot 42, Civil Lines, Opposite High Court Ground, Nagpur - 440001',
    description:
      'Premier box cricket venue in the heart of Nagpur. Features top-quality indoor and outdoor turf, rebound perimeter netting, high-lux shadow-free LED floodlights, and professional digital scoreboard equipment.',
    images: [
      '/images/venues/cricket-turf-02.jpg',
      '/images/venues/cricket-turf-01.jpg',
      '/images/venues/cricket-turf-04.jpg',
    ],
    amenities: [
      'Floodlights',
      'High-speed Bowling Machine',
      'Dressing Room',
      'Covered Dugout',
      'Drinking Water',
      'Ample Parking',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1200,
    isActive: true,
  },
  {
    name: 'Shivaji Park Box Cricket & Practice Pitch',
    sport: 'cricket',
    city: 'Mumbai',
    address: 'Near Portuguese Church, Dadar West, Mumbai - 400028',
    description:
      'Iconic Mumbai cricket hub offering high-density astro turf with true bounce characteristics. Includes side nets for warm-up and precision practice bowling before league clashes.',
    images: [
      '/images/venues/cricket-turf-03.jpg',
      '/images/venues/cricket-turf-01.jpg',
      '/images/venues/cricket-turf-05.jpg',
    ],
    amenities: [
      'Night Floodlights',
      'Cricket Kit Rental',
      'Covered Seating',
      'Drinking Water',
      'Changing Cabins',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1250,
    isActive: true,
  },
  {
    name: 'Kothrud Strikers Cricket Hub',
    sport: 'cricket',
    city: 'Pune',
    address: 'Paud Road, Near Vanaz Metro Station, Kothrud, Pune - 411038',
    description:
      'Championship standard box cricket facility with professional pitch bounce, protective side-padding, bowling run-ups, and stadium-grade floodlight arrays.',
    images: [
      '/images/venues/cricket-turf-04.jpg',
      '/images/venues/cricket-turf-02.jpg',
      '/images/venues/cricket-turf-01.jpg',
    ],
    amenities: [
      'AstroTurf Pitch',
      'LED Floodlights',
      'Equipment Store',
      'Drinking Water',
      'Player Dugout',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1150,
    isActive: true,
  },
  {
    name: 'Andheri West Champions Turf',
    sport: 'cricket',
    city: 'Mumbai',
    address: 'Link Road, Behind Infinity Mall, Andheri West, Mumbai - 400053',
    description:
      'Spacious multi-sport turf facility optimized for competitive box cricket matches with true ball rebound, side nets, and comfortable player gallery.',
    images: [
      '/images/venues/cricket-turf-05.jpg',
      '/images/venues/cricket-turf-03.jpg',
      '/images/venues/cricket-turf-01.jpg',
    ],
    amenities: [
      'Floodlights',
      'Changing Rooms',
      'Drinking Water',
      'Spectator Benches',
      'Parking',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1350,
    isActive: true,
  },
  {
    name: 'Apex Arena Football Turf',
    sport: 'football',
    city: 'Pune',
    address: 'Balewadi High Street Extension, Baner, Pune - 411045',
    description:
      'Championship 7v7 and 5v5 shock-absorbent synthetic grass football turf. Features shock pad cushioning beneath the turf surface to reduce knee strain, spectator seating, and clean shower rooms.',
    images: [
      '/images/venues/football-turf-01.jpg',
      '/images/venues/football-turf-02.jpg',
      '/images/venues/football-turf-03.jpg',
    ],
    amenities: [
      'FIFA-standard Turf',
      'Floodlights',
      'Locker Rooms',
      'First Aid Kit',
      'Cafeteria On-site',
      'Parking',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1400,
    isActive: true,
  },
  {
    name: 'Deccan Thunder 7v7 Football Arena',
    sport: 'football',
    city: 'Pune',
    address: 'Deccan Gymkhana Sports Complex Lane, Pune - 411004',
    description:
      'Tournament-tested outdoor all-weather futsal and football turf pitch equipped with high-tensile safety cages, goals with clean netting, and LED match floodlights.',
    images: [
      '/images/venues/football-turf-02.jpg',
      '/images/venues/football-turf-01.jpg',
      '/images/venues/football-turf-04.jpg',
    ],
    amenities: [
      'Shock-absorbent Turf',
      'Floodlights',
      'Changing Cabins',
      'Drinking Water',
      'Parking',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1300,
    isActive: true,
  },
  {
    name: 'Orange City Futsal & Multi-Turf',
    sport: 'football',
    city: 'Nagpur',
    address: 'Wardha Road, Opposite Airport South Metro, Nagpur - 440015',
    description:
      'Spacious multi-sport turf facility located conveniently off the metro line. Optimized for fast-paced 5-a-side futsal matches with rebound side boards and padded goal frames.',
    images: [
      '/images/venues/football-turf-03.jpg',
      '/images/venues/football-turf-01.jpg',
      '/images/venues/football-turf-02.jpg',
    ],
    amenities: [
      'Futsal Goals',
      'LED Floodlights',
      'Locker Rooms',
      'Ample Two-Wheeler & Car Parking',
      'Beverage Kiosk',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1150,
    isActive: true,
  },
  {
    name: 'Futala Lake Super Turf',
    sport: 'football',
    city: 'Nagpur',
    address: 'Futala Lake Promenade, Amravati Road, Nagpur - 440006',
    description:
      'Breathtaking open-air artificial football turf right next to Futala Lake. Enjoy refreshing breezes and tournament-grade synthetic grass for evening friendlies.',
    images: [
      '/images/venues/football-turf-04.jpg',
      '/images/venues/football-turf-03.jpg',
      '/images/venues/football-turf-01.jpg',
    ],
    amenities: [
      'Lakeview Ambience',
      'LED Floodlights',
      'Player Dugouts',
      'Drinking Water',
      'Parking',
    ],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1200,
    isActive: true,
  },
  {
    name: 'SmashPoint International Badminton Hub',
    sport: 'badminton',
    city: 'Mumbai',
    address: 'Andheri Sports Complex Lane, Andheri West, Mumbai - 400053',
    description:
      'Four BWF-certified wooden suspension badminton courts layered with non-slip vinyl mats. Fully air-conditioned hall with glare-free lighting positioned to eliminate court blindspots.',
    images: [
      '/images/venues/badminton-court-01.jpg',
      '/images/venues/badminton-court-02.jpg',
      '/images/venues/badminton-court-03.jpg',
    ],
    amenities: [
      'BWF Wooden + Vinyl Courts',
      'Air Conditioned',
      'Shoe & Racket Rental',
      'Shower Facilities',
      'Drinking Water',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 650,
    isActive: true,
  },
  {
    name: 'Viman Nagar Indoor Badminton Academy',
    sport: 'badminton',
    city: 'Pune',
    address: 'Clover Park, Viman Nagar, Pune - 411014',
    description:
      'Premier indoor badminton court complex with state-of-the-art synthetic PVC flooring, dedicated coaching staff, pro shop, and comfortable spectator stands.',
    images: [
      '/images/venues/badminton-court-02.jpg',
      '/images/venues/badminton-court-01.jpg',
      '/images/venues/badminton-court-04.jpg',
    ],
    amenities: [
      'Synthetic PVC Mats',
      'Air Coolers',
      'Changing Rooms',
      'Equipment Store',
      'Filtered Drinking Water',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 550,
    isActive: true,
  },
  {
    name: 'Marine Drive Smash Badminton Academy',
    sport: 'badminton',
    city: 'Mumbai',
    address: 'Maharshi Karve Road, Churchgate, Mumbai - 400020',
    description:
      'Distinguished indoor badminton arena with premium maple sprung timber floors, tournament standard nets, shower rooms, and international lighting.',
    images: [
      '/images/venues/badminton-court-03.jpg',
      '/images/venues/badminton-court-01.jpg',
      '/images/venues/badminton-court-02.jpg',
    ],
    amenities: [
      'Wooden Suspension Floor',
      'Showers & Lockers',
      'Pro Shop',
      'Filtered Water',
      'Spectator Gallery',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 700,
    isActive: true,
  },
  {
    name: 'Koregaon Park Shuttle Point',
    sport: 'badminton',
    city: 'Pune',
    address: 'North Main Road, Lane 5, Koregaon Park, Pune - 411001',
    description:
      'Spacious high-clearance badminton facility with competition-grade mats, glare-free indirect floodlights, and clean locker amenities.',
    images: [
      '/images/venues/badminton-court-04.jpg',
      '/images/venues/badminton-court-02.jpg',
      '/images/venues/badminton-court-05.jpg',
    ],
    amenities: [
      'Anti-slip Vinyl Mats',
      'Changing Rooms',
      'Equipment Rental',
      'Drinking Water',
      'Cafeteria',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 600,
    isActive: true,
  },
  {
    name: 'Dharampeth Sports Pavilion Badminton',
    sport: 'badminton',
    city: 'Nagpur',
    address: 'West High Court Road, Dharampeth, Nagpur - 440010',
    description:
      'Historic community sports facility modernized with twin competition-grade Yonex rubber mats, high ceiling clearance, and well-maintained changing areas.',
    images: [
      '/images/venues/badminton-court-05.jpg',
      '/images/venues/badminton-court-01.jpg',
      '/images/venues/badminton-court-03.jpg',
    ],
    amenities: [
      'Yonex Mats',
      'Ceiling Height 30ft+',
      'Changing Rooms',
      'Drinking Water',
      'Parking Area',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 500,
    isActive: true,
  },
  {
    name: 'Hoops Urban Basketball Arena',
    sport: 'basketball',
    city: 'Pune',
    address: 'Kalyani Nagar Jogger’s Park Perimeter, Pune - 411006',
    description:
      'FIBA regulation size acrylic-surfaced outdoor basketball court featuring breakaway spring hoops, tempered glass backboards, perimeter chain-link fences, and high-lumen floodlights for dusk games.',
    images: [
      '/images/venues/basketball-court-01.jpg',
      '/images/venues/basketball-court-02.jpg',
      '/images/venues/basketball-court-03.jpg',
    ],
    amenities: [
      'FIBA Acrylic Surface',
      'Breakaway Hoops',
      'Floodlights',
      'Player Benches',
      'Filtered Water Dispenser',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 800,
    isActive: true,
  },
  {
    name: 'Marine Lines Sky Court Basketball',
    sport: 'basketball',
    city: 'Mumbai',
    address: 'Near Marine Drive Promenade, Marine Lines, Mumbai - 400002',
    description:
      'Rooftop open-air basketball court overlooking South Mumbai. Featuring weatherproof rubberized polyurethane flooring, reinforced backboards, and cool coastal sea breezes during evening pick-up games.',
    images: [
      '/images/venues/basketball-court-02.jpg',
      '/images/venues/basketball-court-01.jpg',
      '/images/venues/basketball-court-04.jpg',
    ],
    amenities: [
      'Polyurethane Sport Floor',
      'LED Tower Lights',
      'Seating Gallery',
      'Drinking Water',
      'Restrooms',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 950,
    isActive: true,
  },
  {
    name: 'Bandra Hoops Downtown Basketball Court',
    sport: 'basketball',
    city: 'Mumbai',
    address: 'Carter Road Promenade, Bandra West, Mumbai - 400050',
    description:
      'Vibrant seaside basketball court with high-traction cushioned surface, regulation keys, tempered glass hoops, and vibrant streetball culture.',
    images: [
      '/images/venues/basketball-court-03.jpg',
      '/images/venues/basketball-court-01.jpg',
      '/images/venues/basketball-court-02.jpg',
    ],
    amenities: [
      'Cushioned Court',
      'Night Lighting',
      'Player Benches',
      'Drinking Water',
      'Parking Area',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 850,
    isActive: true,
  },
  {
    name: 'Dharampeth Slam Dunk Arena',
    sport: 'basketball',
    city: 'Nagpur',
    address: 'Near Shivaji Nagar Park, Dharampeth, Nagpur - 440010',
    description:
      'Dedicated community basketball facility featuring official FIBA layout, perimeter safety netting, spring-loaded hoops, and player locker facilities.',
    images: [
      '/images/venues/basketball-court-04.jpg',
      '/images/venues/basketball-court-02.jpg',
      '/images/venues/basketball-court-01.jpg',
    ],
    amenities: [
      'Acrylic Hardcourt',
      'LED Floodlights',
      'Restrooms',
      'Drinking Water',
      'Ample Parking',
    ],
    openingHours: { open: 6, close: 22 },
    pricePerHour: 750,
    isActive: true,
  },
];

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playarena';

  try {
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to MongoDB for seeding.');

    // Repeatable seeding: upsert by venue name so we never create duplicates or delete user bookings
    let inserted = 0;
    let updated = 0;

    for (const vData of demoVenues) {
      const existing = await Venue.findOne({ name: vData.name });
      if (!existing) {
        await Venue.create(vData);
        inserted++;
      } else {
        // Update details while preserving any booking relations
        Object.assign(existing, vData);
        await existing.save();
        updated++;
      }
    }

    // Normalize any legacy venues in the collection
    const allVenues = await Venue.find();
    for (const v of allVenues) {
      let changed = false;
      if (!v.pricePerHour && v.get('hourlyPrice')) {
        v.pricePerHour = v.get('hourlyPrice');
        changed = true;
      }
      if (!v.openingHours || !v.openingHours.open) {
        v.openingHours = {
          open: v.get('openingHour') || 6,
          close: v.get('closingHour') || 23,
        };
        changed = true;
      }
      if (changed) {
        await v.save();
      }
    }

    console.log(
      `[Seed Complete] ${inserted} venues inserted, ${updated} venues updated. Total venues: ${await Venue.countDocuments()}`
    );
    console.log('Fictional sports venues across Nagpur, Pune, and Mumbai seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
}

seedDatabase();
