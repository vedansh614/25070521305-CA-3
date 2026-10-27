import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/playarena';
const CLIENT_PUBLIC = path.join(__dirname, '../../client/public');

const venueSchema = new mongoose.Schema({
  name: String,
  sport: String,
  city: String,
  images: [String],
});

const Venue = mongoose.models.Venue || mongoose.model('Venue', venueSchema);

async function verifyImages() {
  console.log('Connecting to MongoDB at:', MONGO_URI);
  await mongoose.connect(MONGO_URI);

  const venues = await Venue.find({}).lean();
  console.log(`\nFound ${venues.length} venues in database.`);

  let totalErrors = 0;
  const venueReport = [];

  for (const v of venues) {
    const sport = v.sport.toLowerCase();
    const cover = v.images[0];
    const gallery = v.images;

    // 1. Check primary cover exists
    if (!cover) {
      console.error(`[FAIL] Venue "${v.name}" has no primary cover image.`);
      totalErrors++;
      continue;
    }

    // 2. Check local file exists for all images
    for (const imgPath of gallery) {
      const fullPath = path.join(CLIENT_PUBLIC, imgPath.replace(/^\//, ''));
      if (!fs.existsSync(fullPath)) {
        console.error(`[FAIL] Venue "${v.name}" references non-existent file: ${imgPath}`);
        totalErrors++;
      }
    }

    // 3. Check sport matches image filename prefix
    const coverBasename = path.basename(cover).toLowerCase();
    let sportMatch = false;
    if (sport === 'cricket' && coverBasename.startsWith('cricket')) sportMatch = true;
    if (sport === 'football' && coverBasename.startsWith('football')) sportMatch = true;
    if (sport === 'badminton' && coverBasename.startsWith('badminton')) sportMatch = true;
    if (sport === 'basketball' && coverBasename.startsWith('basketball')) sportMatch = true;

    if (!sportMatch) {
      console.error(`[FAIL] Venue "${v.name}" (${sport}) has non-matching cover image: ${coverBasename}`);
      totalErrors++;
    }

    // 4. Check for unneeded duplicates in gallery
    const uniqueImages = new Set(gallery);
    if (uniqueImages.size !== gallery.length) {
      console.warn(`[WARN] Venue "${v.name}" has duplicate images in gallery.`);
    }

    venueReport.push({
      name: v.name,
      sport: v.sport,
      city: v.city,
      cover: cover,
      galleryCount: gallery.length,
      sportMatch,
    });
  }

  // 5. Check categories images
  const categories = ['cricket.jpg', 'football.jpg', 'badminton.jpg', 'basketball.jpg'];
  for (const cat of categories) {
    const catPath = path.join(CLIENT_PUBLIC, 'images/categories', cat);
    if (!fs.existsSync(catPath)) {
      console.error(`[FAIL] Category image missing: ${cat}`);
      totalErrors++;
    }
  }

  // 6. Check fallbacks
  const fallbacks = ['cricket.svg', 'football.svg', 'badminton.svg', 'basketball.svg', 'default.svg'];
  for (const fb of fallbacks) {
    const fbPath = path.join(CLIENT_PUBLIC, 'images/fallbacks', fb);
    if (!fs.existsSync(fbPath)) {
      console.error(`[FAIL] Fallback SVG missing: ${fb}`);
      totalErrors++;
    }
  }

  // 7. Verify HTTP responses from Vite dev server if running
  console.log('\nChecking HTTP availability of all images on Vite dev server (http://localhost:5173)...');
  let httpOk = 0;
  let httpFailed = 0;
  for (const v of venueReport) {
    try {
      const res = await fetch(`http://localhost:5173${v.cover}`);
      if (res.status === 200) {
        httpOk++;
      } else {
        httpFailed++;
        console.error(`[FAIL] HTTP ${res.status} for ${v.cover}`);
      }
    } catch (e) {
      console.warn(`[SKIP] Vite HTTP check skipped (dev server not listening on 5173 or connection refused): ${e.message}`);
      break;
    }
  }

  console.log(`\nHTTP Check Summary: ${httpOk} succeeded, ${httpFailed} failed.`);

  console.log('\n============================================================');
  console.log('VENUE IMAGE AUDIT TABLE');
  console.log('============================================================');
  console.table(venueReport.map(r => ({
    Venue: r.name,
    Sport: r.sport,
    City: r.city,
    'Cover Image': r.cover,
    'Gallery Photos': r.galleryCount,
    'Sport Valid': r.sportMatch ? 'PASS' : 'FAIL',
  })));

  if (totalErrors === 0) {
    console.log('\n>>> SUCCESS: ALL VENUE, CATEGORY, AND FALLBACK IMAGES ARE VERIFIED AND COMPLIANT! <<<');
  } else {
    console.error(`\n>>> FAILURE: Detected ${totalErrors} image integrity error(s). <<<`);
    process.exit(1);
  }

  await mongoose.disconnect();
}

verifyImages().catch((err) => {
  console.error('Fatal error during image verification:', err);
  process.exit(1);
});
