const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const mongoose = require('mongoose');

// Point to dedicated test database
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/playarena_test';
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key_playarena_12345';

const { app } = require('../src/server');
const User = require('../src/models/User');
const Venue = require('../src/models/Venue');
const Booking = require('../src/models/Booking');
const { getRollingDates } = require('../src/utils/dateUtils');

let serverInstance;
let baseUrl;

// Helper to make HTTP requests with cookie support
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

  // Extract set-cookie if present
  const setCookie = response.headers.get('set-cookie');

  return {
    status: response.status,
    data,
    headers: response.headers,
    setCookie,
  };
}

test.before(async () => {
  // Connect to test database and clean it
  await mongoose.connect(process.env.MONGODB_URI);
  await mongoose.connection.dropDatabase();

  await Promise.all([
    User.syncIndexes(),
    Venue.syncIndexes(),
    Booking.syncIndexes(),
  ]);

  // Start HTTP server on dynamic port
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

test('Health endpoint returns healthy status and database connection info', async () => {
  const res = await makeRequest('/api/health');
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.data.status, 'healthy');
  assert.strictEqual(res.data.database.status, 'connected');
});

test('Auth: Registration succeeds and rejects duplicate email', async () => {
  // 1. Success registration
  const regRes = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: {
      name: 'Rohan Sharma',
      email: 'rohan.test@playarena.local',
      password: 'password123',
      confirmPassword: 'password123',
    },
  });
  assert.strictEqual(regRes.status, 201);
  assert.strictEqual(regRes.data.success, true);
  assert.strictEqual(regRes.data.user.role, 'USER');

  // 2. Duplicate registration with same email
  const dupRes = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: {
      name: 'Rohan Duplicate',
      email: 'rohan.test@playarena.local',
      password: 'password123',
      confirmPassword: 'password123',
    },
  });
  assert.strictEqual(dupRes.status, 400);
  assert.strictEqual(dupRes.data.success, false);
  assert.match(dupRes.data.message, /already exists/i);
});

test('Auth: Login verifies password, rejects invalid credentials, sets HttpOnly cookie', async () => {
  // Wrong password
  const failRes = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'rohan.test@playarena.local',
      password: 'wrong_password',
    },
  });
  assert.strictEqual(failRes.status, 401);
  assert.strictEqual(failRes.data.success, false);

  // Correct password
  const successRes = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: {
      email: 'rohan.test@playarena.local',
      password: 'password123',
    },
  });
  assert.strictEqual(successRes.status, 200);
  assert.strictEqual(successRes.data.success, true);
  assert.ok(successRes.data.token);
  assert.ok(successRes.setCookie, 'HttpOnly token cookie should be set');
  assert.match(successRes.setCookie, /HttpOnly/i);

  // Verify session restoration using the returned cookie
  const cookieHeader = successRes.setCookie.split(';')[0];
  const meRes = await makeRequest('/api/auth/me', {
    headers: { Cookie: cookieHeader },
  });
  assert.strictEqual(meRes.status, 200);
  assert.strictEqual(meRes.data.user.email, 'rohan.test@playarena.local');
});

test('Security: Public signup cannot tamper with role to become ADMIN', async () => {
  const res = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: {
      name: 'Hacker Attempt',
      email: 'hacker@playarena.local',
      password: 'password123',
      role: 'ADMIN', // Maliciously supplied role
    },
  });
  assert.strictEqual(res.status, 201);
  assert.strictEqual(res.data.user.role, 'USER', 'Server must ignore client-supplied role');
});

test('Authorization: Regular user cannot access admin endpoints; Admin can', async () => {
  // Login regular user
  const userLogin = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'rohan.test@playarena.local', password: 'password123' },
  });
  const userCookie = userLogin.setCookie.split(';')[0];

  // Try admin stats with user cookie
  const deniedRes = await makeRequest('/api/admin/stats', {
    headers: { Cookie: userCookie },
  });
  assert.strictEqual(deniedRes.status, 403);

  // Create real admin in DB
  const admin = await User.create({
    name: 'College CA Admin',
    email: 'admin.test@playarena.local',
    password: 'AdminPassword123',
    role: 'ADMIN',
  });

  const adminLogin = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin.test@playarena.local', password: 'AdminPassword123' },
  });
  const adminCookie = adminLogin.setCookie.split(';')[0];

  const adminRes = await makeRequest('/api/admin/stats', {
    headers: { Cookie: adminCookie },
  });
  assert.strictEqual(adminRes.status, 200);
  assert.ok(adminRes.data.stats);
  assert.strictEqual(typeof adminRes.data.stats.totalVenues, 'number');
});

test('Venues: Create, filter by city and sport, and retrieve slots', async () => {
  // Admin creates a venue
  const adminLogin = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'admin.test@playarena.local', password: 'AdminPassword123' },
  });
  const adminCookie = adminLogin.setCookie.split(';')[0];

  const createVenueRes = await makeRequest('/api/venues', {
    method: 'POST',
    headers: { Cookie: adminCookie },
    body: {
      name: 'Nagpur Test Box Cricket',
      sport: 'cricket',
      city: 'Nagpur',
      address: 'Dharampeth, Nagpur',
      description: 'Test turf ground description',
      images: ['https://images.unsplash.com/photo-1540747913346-19e32dc3e97e'],
      amenities: ['Floodlights', 'Drinking Water'],
      openingHours: { open: 6, close: 23 },
      pricePerHour: 1000,
      isActive: true,
    },
  });
  assert.strictEqual(createVenueRes.status, 201);
  const venueId = createVenueRes.data.venue._id;

  // Filter venues by city
  const filterCityRes = await makeRequest('/api/venues?city=Nagpur');
  assert.strictEqual(filterCityRes.status, 200);
  assert.ok(filterCityRes.data.venues.some((v) => v._id === venueId));

  // Filter venues by mismatch city
  const filterPuneRes = await makeRequest('/api/venues?city=Pune');
  assert.strictEqual(filterPuneRes.status, 200);
  assert.ok(!filterPuneRes.data.venues.some((v) => v._id === venueId));

  // Retrieve slots for tomorrow
  const dates = getRollingDates(14);
  const tomorrowDate = dates[1]; // Tomorrow

  const slotsRes = await makeRequest(`/api/venues/${venueId}/slots?date=${tomorrowDate}`);
  assert.strictEqual(slotsRes.status, 200);
  assert.ok(Array.isArray(slotsRes.data.slots));
  assert.ok(slotsRes.data.slots.length > 0);
  assert.strictEqual(slotsRes.data.slots[0].isAvailable, true);
});

test('Bookings: Slot reservation, owner isolation, and cancellation releasing the slot', async () => {
  // 1. Get venue
  const venuesRes = await makeRequest('/api/venues?city=Nagpur');
  const venue = venuesRes.data.venues[0];

  // 2. Register User B (Vikram)
  await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: {
      name: 'Vikram Patel',
      email: 'vikram.test@playarena.local',
      password: 'password123',
      confirmPassword: 'password123',
    },
  });

  const userALogin = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'rohan.test@playarena.local', password: 'password123' },
  });
  const userACookie = userALogin.setCookie.split(';')[0];

  const userBLogin = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'vikram.test@playarena.local', password: 'password123' },
  });
  const userBCookie = userBLogin.setCookie.split(';')[0];

  const tomorrow = getRollingDates(14)[1];
  const targetSlot = '18:00 - 19:00';

  // 3. User A books the slot
  const bookingRes = await makeRequest('/api/bookings', {
    method: 'POST',
    headers: { Cookie: userACookie },
    body: {
      venueId: venue._id,
      bookingDate: tomorrow,
      slotLabel: targetSlot,
    },
  });
  assert.strictEqual(bookingRes.status, 201);
  assert.strictEqual(bookingRes.data.success, true);
  assert.strictEqual(bookingRes.data.booking.amount, venue.pricePerHour);
  const bookingId = bookingRes.data.booking._id;

  // 4. Verify slot is now BOOKED when checking availability
  const slotsAfterRes = await makeRequest(`/api/venues/${venue._id}/slots?date=${tomorrow}`);
  const slotData = slotsAfterRes.data.slots.find((s) => s.slotLabel === targetSlot);
  assert.ok(slotData);
  assert.strictEqual(slotData.status, 'BOOKED');
  assert.strictEqual(slotData.isBooked, true);

  // 5. OWNER ISOLATION: User B tries to view User A's ticket -> 403 Forbidden
  const forbiddenTicketRes = await makeRequest(`/api/bookings/${bookingId}`, {
    headers: { Cookie: userBCookie },
  });
  assert.strictEqual(forbiddenTicketRes.status, 403);

  // 6. OWNER ISOLATION: User B tries to cancel User A's booking -> 403 Forbidden
  const forbiddenCancelRes = await makeRequest(`/api/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: { Cookie: userBCookie },
    body: { reason: 'Unauthorized cancellation' },
  });
  assert.strictEqual(forbiddenCancelRes.status, 403);

  // 7. User A views their own ticket -> 200 OK
  const ownerTicketRes = await makeRequest(`/api/bookings/${bookingId}`, {
    headers: { Cookie: userACookie },
  });
  assert.strictEqual(ownerTicketRes.status, 200);
  assert.strictEqual(ownerTicketRes.data.booking.bookingReference, bookingRes.data.booking.bookingReference);

  // 8. User A cancels their booking
  const cancelRes = await makeRequest(`/api/bookings/${bookingId}/cancel`, {
    method: 'PUT',
    headers: { Cookie: userACookie },
    body: { reason: 'Schedule changed' },
  });
  assert.strictEqual(cancelRes.status, 200);
  assert.strictEqual(cancelRes.data.booking.status, 'CANCELLED');

  // 9. Verify slot is now RELEASED and AVAILABLE again
  const slotsAfterCancel = await makeRequest(`/api/venues/${venue._id}/slots?date=${tomorrow}`);
  const releasedSlot = slotsAfterCancel.data.slots.find((s) => s.slotLabel === targetSlot);
  assert.ok(releasedSlot);
  assert.strictEqual(releasedSlot.status, 'AVAILABLE');
  assert.strictEqual(releasedSlot.isBooked, false);
});
