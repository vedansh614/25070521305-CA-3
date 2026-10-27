const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const mongoose = require('mongoose');

process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/playarena_concurrency_test';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_playarena_concurrency';

const { app } = require('../src/server');
const User = require('../src/models/User');
const Venue = require('../src/models/Venue');
const Booking = require('../src/models/Booking');
const { getRollingDates } = require('../src/utils/dateUtils');

let serverInstance;
let baseUrl;

async function makeRequest(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const fetchOptions = {
    method: options.method || 'GET',
    headers,
  };
  if (options.body) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  let data = null;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  }
  return { status: response.status, data, headers: response.headers };
}

test.before(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.dropDatabase();

  await Promise.all([
    User.syncIndexes(),
    Venue.syncIndexes(),
    Booking.syncIndexes(),
  ]);

  serverInstance = http.createServer(app);
  await new Promise((resolve) => {
    serverInstance.listen(0, () => {
      const port = serverInstance.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

test('CONCURRENCY TEST: Two simultaneous booking attempts for the same slot -> Exactly ONE wins (201) and ONE gets 409 conflict', async () => {
  // 1. Create a venue
  const venue = await Venue.create({
    name: 'Concurrent Arena Futsal',
    sport: 'football',
    city: 'Pune',
    address: 'Koregaon Park, Pune',
    description: 'High traffic futsal arena for concurrency verification',
    images: ['https://images.unsplash.com/photo-1574629810360-7efbbe195018'],
    amenities: ['Floodlights', 'Lockers'],
    openingHours: { open: 6, close: 23 },
    pricePerHour: 1200,
    isActive: true,
  });

  // 2. Register User 1 & User 2
  const user1 = await User.create({
    name: 'Competitor One',
    email: 'user1.concurrency@playarena.local',
    password: 'password123',
    role: 'USER',
  });

  const user2 = await User.create({
    name: 'Competitor Two',
    email: 'user2.concurrency@playarena.local',
    password: 'password123',
    role: 'USER',
  });

  // Log in both
  const login1 = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'user1.concurrency@playarena.local', password: 'password123' },
  });
  const token1 = login1.data.token;

  const login2 = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'user2.concurrency@playarena.local', password: 'password123' },
  });
  const token2 = login2.data.token;

  const targetDate = getRollingDates(14)[2]; // 2 days from now
  const targetSlot = '19:00 - 20:00';

  const bookingPayload = {
    venueId: venue._id.toString(),
    bookingDate: targetDate,
    slotLabel: targetSlot,
  };

  // 3. Fire BOTH booking requests in true parallel via Promise.all
  console.log('[Test] Firing parallel booking requests from User 1 and User 2...');
  const [res1, res2] = await Promise.all([
    makeRequest('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token1}` },
      body: bookingPayload,
    }),
    makeRequest('/api/bookings', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token2}` },
      body: bookingPayload,
    }),
  ]);

  console.log(`[Test Result] Request 1 status: ${res1.status}, Request 2 status: ${res2.status}`);

  const statuses = [res1.status, res2.status].sort();

  // Exactly one request must succeed with 201, and one must fail with 409 Conflict
  assert.deepStrictEqual(
    statuses,
    [201, 409],
    `Expected one 201 (Created) and one 409 (Conflict). Got ${res1.status} and ${res2.status}`
  );

  const winningRes = res1.status === 201 ? res1 : res2;
  const losingRes = res1.status === 409 ? res1 : res2;

  assert.strictEqual(winningRes.data.success, true);
  assert.ok(winningRes.data.booking._id);

  assert.strictEqual(losingRes.data.success, false);
  assert.strictEqual(losingRes.data.code, 'SLOT_CONFLICT');
  assert.match(losingRes.data.message, /already been confirmed|choose another/i);

  // 4. Verify MongoDB only has ONE confirmed booking for this venue and slot
  const bookingsInDb = await Booking.find({
    venue: venue._id,
    bookingDate: targetDate,
    slotLabel: targetSlot,
    status: 'CONFIRMED',
  });

  assert.strictEqual(
    bookingsInDb.length,
    1,
    'Database must contain exactly 1 confirmed booking for this slot'
  );
});
