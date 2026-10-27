# PLAYARENA — 5-Minute Viva Demonstration Guide & Oral Exam Prep

> **Student Provisional PRN:** `25070521305`  
> **Course Assessment:** CA-03 Continuous Assessment Project  
> **Project Name:** PLAYARENA — Sports Turf & Court Booking System  
> **Target GitHub Repository:** `25070521305-CA-03`

---

## 1. Five-Minute Demonstration Sequence for Evaluators

Follow this exact sequence during your practical viva to demonstrate all mandatory features smoothly:

### Minute 1: Homepage & Real-time Discovery
1. Open the browser at `http://localhost:5173/`.
2. Highlight the original sports-theme design: Deep Navy background (`#070d18`), Emerald accents (`#10b981`), and Lime highlights (`#a3e635`).
3. Show the working search bar:
   - Select City: `Nagpur`.
   - Select Sport: `Cricket`.
   - Click **Search Slots**.
4. Show how the Explore page dynamically syncs filters with URL search parameters (`/venues?city=Nagpur&sport=cricket`) and displays the filtered grounds.

### Minute 2: Venue Inspection & 14-Day Slot Engine
1. Click **Book Slot** on **GreenField Box Cricket Turf**.
2. Show the photo gallery with interactive thumbnails, operating hours (`06:00 - 23:00 IST`), and turf amenities.
3. Show the **14-day rolling calendar**:
   - Click on tomorrow's date pill.
   - Show how the hourly slots update dynamically with distinct visual styles (Green for Available, Grayed-out for Past hours, Red for Booked).
   - Select an available evening slot (e.g., `18:00 - 19:00`).

### Minute 3: Authentication & Booking Flow
1. Click **Proceed to Booking Review** (or **Log In to Reserve Slot**).
2. Show the split-screen **Signup** page:
   - Name: `Demo Player`
   - Email: `demo.player@playarena.local`
   - Password: `password123`
3. Submit and observe the green success banner redirecting to **Login**.
4. Log in and notice that the system returns you smoothly to your pending booking review.
5. On the **Booking Review** screen, highlight:
   - Price calculation performed by the server (`₹1,100`).
   - The **Pay at Venue** guarantee: No fake credit card forms; cash or UPI is collected on-site.
6. Click **Confirm & Generate Ticket**.

### Minute 4: Booking Ticket & Cancellation
1. The **Booking Ticket** displays:
   - Unique reference code (`PA-YYYYMMDD-XXXX`).
   - Venue snapshot, match date, slot, and status (`CONFIRMED`).
2. Click **Print / Save as PDF** to demonstrate that clean `@media print` CSS removes the navigation header and renders a physical ticket pass.
3. Navigate to **My Bookings**:
   - Show the newly booked slot under the **Upcoming Matches** tab.
4. Click **Cancel Slot**:
   - The confirmation modal opens with a choice of cancellation reasons.
   - Confirm cancellation.
   - The booking moves to **Cancelled History**, preserving historical records without deleting data.
5. Return to the venue details page to prove the slot is now **Available** again!

### Minute 5: Administrator Portal & MongoDB Inspection
1. Click **Logout**, then sign in with the Administrator account:
   - Email: `admin@playarena.local`
   - Password: `AdminSecure@2026`
2. Navigate to `/admin`:
   - Point out real MongoDB counts for registered users, active grounds, confirmed bookings, and cancellations.
   - Point out the honest labeling: **Expected Pay-at-Venue Volume** (not fake collected revenue).
3. Demonstrate **Venue Management CRUD**:
   - Open **Add New Ground** to demonstrate creation.
   - Edit an existing ground's hourly rate.
   - Explain that deleting a venue with past bookings automatically **deactivates** it to protect historical customer bookings.
4. Open **MongoDB Compass** (`mongodb://127.0.0.1:27017/playarena`) and show the database collections: `venues`, `users`, and `bookings` with their indexes.

---

## 2. Feature Checklist to Prove Viva Requirements

| Requirement | How to Prove to the Examiner |
|---|---|
| **CRUD Operations** | • **Create:** User signup (`/signup`), booking reservation (`/book/:id`), admin ground creation (`/admin`).<br>• **Read:** Venue catalog, slot availability grid, user booking history, printable ticket.<br>• **Update:** User profile name (`/profile`), admin ground modification.<br>• **Delete / Release:** Booking cancellation (`/my-bookings`), ground safe deactivation/deletion. |
| **Authentication & Security** | • Passwords hashed with **bcrypt** (inspect `$2a$...` strings in MongoDB Compass).<br>• JWT tokens stored in **HttpOnly, SameSite=Lax** cookies preventing XSS token theft.<br>• Public signup hardcodes `role: 'USER'`, blocking role privilege escalation.<br>• Auth rate limiter blocks automated brute force attacks. |
| **Database Persistence** | • Refresh browser or restart server; user session, grounds, and bookings remain intact in MongoDB.<br>• Standalone local MongoDB installation with zero replica set or change stream requirements. |
| **Concurrency Correctness** | • Run `npm test` in the `server` folder to show the automated test `tests/concurrency.test.js`.<br>• Show that two simultaneous requests for the same slot result in exactly 1 winning booking and 1 receiving `HTTP 409 Conflict`. |
| **Real-Time Sync** | • Socket.IO room broadcast emits availability updates to all connected browser windows when a slot is confirmed or cancelled. |

---

## 3. Top Viva Questions & Precise Technical Answers

### Q1: How does your application prevent double-booking if two users click "Book Slot" at the exact same millisecond?
> **Answer:**  
> "We do not rely on frontend button disabling or preliminary read queries, which are subject to race conditions. Instead, we enforce a **database-level partial unique compound index** in MongoDB on `{ venue: 1, startTime: 1 }` with a partial filter expression `{ status: 'CONFIRMED' }`. When two simultaneous requests hit MongoDB, the engine’s atomic write lock guarantees that the first document is inserted, and the second is rejected with error code `11000 (Duplicate Key)`. Our controller intercepts this error and returns an `HTTP 409 Conflict` response with a friendly explanation."

---

### Q2: Why did you use a partial unique index instead of a standard unique index?
> **Answer:**  
> "If a customer cancels their booking, we change its status to `CANCELLED` so their booking history and ticket reference remain on record. If the unique index were unconditional, the cancelled record would still occupy `{ venue, startTime }` and prevent anyone else from booking that slot. With `{ partialFilterExpression: { status: 'CONFIRMED' } }`, only active bookings are constrained by uniqueness. As soon as a reservation is marked `CANCELLED`, it drops out of the index and the slot becomes immediately available for other players."

---

### Q3: Why is the JWT stored in an HttpOnly cookie rather than localStorage?
> **Answer:**  
> "Storing authentication tokens in `localStorage` makes them accessible to JavaScript, leaving them vulnerable to Cross-Site Scripting (XSS) attacks. By setting the token inside an **HttpOnly cookie**, the browser prevents client-side scripts from reading or stealing the token. We also configure `sameSite: 'lax'` to protect against CSRF attacks during local development."

---

### Q4: How do you handle timezones for venues and slot calculations?
> **Answer:**  
> "All slot start and end instants are converted into explicit UTC Date objects using our `createSlotInstant()` utility. However, the calendar dates and slot labels are anchored to **Asia/Kolkata (IST = UTC+05:30)**. This guarantees consistent 1-hour slot boundaries regardless of whether the client or server system runs in UTC or Indian Standard Time."

---

### Q5: How do you preserve historical booking accuracy if a venue's price or name changes later?
> **Answer:**  
> "When a booking is confirmed, our backend embeds a `venueSnapshot` subdocument containing the venue's name, sport, address, and hourly rate at that precise moment. If an administrator later updates the venue's hourly rate or address, the customer's previous booking ticket retains the exact historical details and price paid."

---

### Q6: What happens if an admin tries to delete a venue that already has bookings?
> **Answer:**  
> "To prevent breaking database references and corrupting customer booking records, our backend checks `Booking.countDocuments({ venue: venue._id })`. If any booking history exists, permanent deletion is blocked; instead, the venue's `isActive` flag is toggled to `false`. Deactivated venues are hidden from public listings and cannot accept new reservations, while past customer tickets remain fully accessible."

---

### Q7: Why is "Pay at Venue" used instead of an online payment gateway?
> **Answer:**  
> "Mock online payment forms create a misleading illusion of collected revenue. For a college project, 'Pay at Venue' reflects real-world local sports turf practices, where players book their court in advance and settle via cash or UPI at the turf counter on match day. In the Admin Dashboard, we honestly label this metric as **'Expected Pay-at-Venue Volume'** rather than collected revenue."
