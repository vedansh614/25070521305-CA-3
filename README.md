# PLAYARENA — Sports Turf & Court Booking System

> **College Continuous Assessment CA-03 Submission**  
> **Provisional PRN:** `25070521305` *(Please verify your PRN against your official college admission record)*  
> **Target GitHub Repository:** `25070521305-CA-03`  
> **Final Folder Requirement:** The final submitted outer folder must be named with your PRN only (`25070521305`). See the [Folder Renaming Instructions](#folder-renaming-instructions) section below.

---

## 1. Project Purpose & Features

**PLAYARENA** is a full-stack sports facility reservation platform engineered for real-time booking of box cricket turfs, football pitches, wooden badminton courts, and basketball arenas across **Nagpur, Pune, and Mumbai**.

### Key System Capabilities
- **Strict Concurrency Protection:** Employs a database-enforced compound partial unique index on `{ venue: 1, startTime: 1 }` (filtered for confirmed bookings), guaranteeing at the database engine level that two simultaneous booking attempts for the same slot result in exactly one successful reservation and one atomic `HTTP 409 Conflict`.
- **Real-Time Live Availability:** Integrates **Socket.IO** rooms to instantly broadcast availability changes across all active client browser sessions when a slot is reserved or cancelled.
- **Pay-at-Venue Workflow:** Eliminates mock online payment gateways. Generates an authentic booking ticket with a unique reference code (`PA-YYYYMMDD-XXXX`) to present at the venue desk for on-site cash or UPI payment.
- **Historical Accuracy Preservation:** Embeds a snapshot of the venue's name, address, sport, and price inside each booking document at creation time, preserving historical receipt accuracy even if venue parameters change later.
- **Complete Role-Based Authorization:** Separate customer and administrator experiences. Public registration enforces the `USER` role; administrative accounts can only be provisioned locally via protected command-line environment scripts.
- **Printable Booking Ticket:** Features print-specific CSS (`@media print`) and a native "Print / Save as PDF" action for match passes.
- **Zero-Data-Loss Cancellation:** Allows customers to cancel future bookings, marking the reservation as `CANCELLED` in history while instantly releasing the database slot for other players.

---

## 2. Technology Stack

| Layer | Technologies Used | Description |
|---|---|---|
| **Frontend** | React 19, Vite, JavaScript, React Router v7, Lucide Icons | Responsive single-page application with dark navy/emerald styling |
| **Styling** | Vanilla CSS with Custom Design Tokens & Print Media Rules | Polished dark mode, responsive layout, accessible focus rings |
| **State & Real-time** | React Context (`AuthContext`, `SocketContext`), Socket.IO Client | Session persistence, real-time slot synchronization |
| **Backend** | Node.js (CommonJS), Express 4 | RESTful API, authentication cookies, security middlewares |
| **Database** | MongoDB & Mongoose (Standalone Local Installation) | Atomic concurrency, indexes, document validation |
| **Authentication** | JWT stored in HttpOnly Cookies + Bcrypt password hashing | Protects session tokens from XSS attacks |

---

## 3. Project Organization

```text
25070521305/
├── client/                     # React + Vite application
│   ├── public/
│   │   └── favicon.svg         # PlayArena brand icon
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Navigation, auth dropdown, mobile drawer
│   │   │   ├── Footer.jsx      # Project disclaimer, quick links, PRN notice
│   │   │   ├── VenueCard.jsx   # Standardized 16:10 aspect ratio cards
│   │   │   ├── SlotPicker.jsx  # 14-day rolling schedule & IST slot grid
│   │   │   └── CancellationModal.jsx # Slot release confirmation dialog
│   │   ├── context/
│   │   │   ├── AuthContext.jsx # User state, login, signup, session refresh
│   │   │   └── SocketContext.jsx # Socket.IO connection and rooms
│   │   ├── pages/              # Application views
│   │   │   ├── Home.jsx        # Hero, sports categories, featured grounds
│   │   │   ├── ExploreVenues.jsx # Live search, city & sport filters, price sort
│   │   │   ├── VenueDetails.jsx # Photo gallery, specifications, slot picker
│   │   │   ├── BookingReview.jsx# Price breakdown, pay-at-venue terms
│   │   │   ├── BookingTicket.jsx# Printable pass with reference code
│   │   │   ├── MyBookings.jsx  # Upcoming, past, and cancelled tabs
│   │   │   ├── Profile.jsx     # Account overview & name update
│   │   │   ├── Login.jsx       # Split-screen login with demo helper
│   │   │   ├── Signup.jsx      # Split-screen registration with validation
│   │   │   ├── AdminDashboard.jsx # Real metrics, inventory CRUD, booking inspection
│   │   │   └── NotFound.jsx    # Custom 404 page
│   │   ├── services/
│   │   │   └── api.js          # Centralized fetch client with credentials
│   │   ├── App.jsx             # Route definitions & layout structure
│   │   ├── index.css           # Global design system tokens & print styles
│   │   └── main.jsx            # React root mount
│   ├── package.json
│   ├── vite.config.js          # Proxy setup (/api and /socket.io to port 5000)
│   └── .env.example
├── server/                     # Node.js + Express backend
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js           # Mongoose connection & index synchronization
│   │   │   └── socket.js       # Socket.IO broadcaster engine
│   │   ├── controllers/
│   │   │   ├── authController.js    # Register, login, session check, profile
│   │   │   ├── venueController.js   # Filters, slots, admin venue CRUD
│   │   │   ├── bookingController.js # Atomic slot reservation, ticket, cancel
│   │   │   └── adminController.js   # Metrics, bookings table, users
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js    # JWT verification & role authorization
│   │   │   ├── rateLimiter.js       # Brute-force rate limiting
│   │   │   ├── errorHandler.js      # Centralized error handler (409 conflict handling)
│   │   │   └── validation.js        # ObjectId parameter validation
│   │   ├── models/
│   │   │   ├── User.js              # Bcrypt hashing, safe serialization
│   │   │   ├── Venue.js             # Ground specifications & amenities
│   │   │   └── Booking.js           # Compound unique index & venue snapshots
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── venueRoutes.js
│   │   │   ├── bookingRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   └── healthRoutes.js
│   │   ├── scripts/
│   │   │   ├── seed.js              # 9+ fictional sports grounds in Nagpur/Pune/Mumbai
│   │   │   └── createAdmin.js       # Secure local admin provisioning script
│   │   ├── utils/
│   │   │   └── dateUtils.js         # Asia/Kolkata timezone & rolling calendar utilities
│   │   └── server.js                # Express app & HTTP/Socket server
│   ├── tests/
│   │   ├── api.test.js              # Auth, isolation, filters, cancel tests
│   │   ├── concurrency.test.js      # True simultaneous parallel booking collision test
│   │   └── live_system_check.js     # Live 21-point system verification suite
│   ├── package.json
│   ├── .env.example
│   └── .env
├── .gitignore                  # node_modules, .env, build output, logs
├── DEMO_GUIDE.md               # 5-minute viva demo sequence & Q&A
└── README.md                   # This documentation
```

---

## 4. Local Development Setup (Windows Compatible)

### Prerequisites
1. **Node.js**: v18.0.0 or higher (v24.22.0 verified).
2. **MongoDB**: Local standalone MongoDB Community Server running on `mongodb://127.0.0.1:27017`.
3. **PowerShell** or Command Prompt.

### Step-by-Step Installation

#### 1. Setup Server
Open PowerShell in the project root:
```powershell
cd server
npm install
```

Configure your environment file:
```powershell
Copy-Item .env.example .env
```
Default `.env` contents:
```env
PORT=5000
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/playarena
JWT_SECRET=playarena_super_secure_jwt_secret_college_ca03_25070521305
JWT_EXPIRES_IN=7d
ADMIN_NAME=PlayArena Administrator
ADMIN_EMAIL=admin@playarena.local
ADMIN_PASSWORD=AdminSecure@2026
```

Seed the sports venues into MongoDB:
```powershell
npm run seed
```

Create the local administrator account:
```powershell
npm run create-admin
```

Start the backend server:
```powershell
npm run dev
```
*Backend runs at `http://localhost:5000`.*

#### 2. Setup Client
Open a second PowerShell window in the project root:
```powershell
cd client
npm install
```

Start the frontend Vite development server:
```powershell
npm run dev
```
*Frontend runs at `http://localhost:5173`.*

---

## 5. MongoDB Compass Connection Steps

1. Launch **MongoDB Compass**.
2. In the **New Connection** tab, paste the standard local URI:
   ```text
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. In the left database pane, select `playarena`.
5. You will see three collections:
   - `venues`: Sports turf facilities with prices, coordinates, and operating hours.
   - `users`: Registered players and administrator accounts with bcrypt password hashes (`$2a$...`).
   - `bookings`: Active and cancelled match reservations with venue snapshots and unique booking references.
6. Under `bookings` > **Indexes**, note the compound index:
   ```json
   { "venue": 1, "startTime": 1 }
   ```
   with partial filter expression `{ "status": "CONFIRMED" }`.

---

## 6. Pre-Configured Demo Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **Administrator** | `admin@playarena.local` | `AdminSecure@2026` | Full Admin Dashboard, Venue CRUD, All Bookings |
| **Player (Customer)** | Register via `/signup` or use seeded accounts | Configured during signup | Browse, Book, Manage Bookings, Print Tickets |

---

## 7. API Endpoints Table

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Public | Register new player with duplicate email check |
| `POST` | `/api/auth/login` | Public | Authenticate user, set HttpOnly cookie & return token |
| `GET` | `/api/auth/me` | Private | Restore session on browser refresh |
| `PUT` | `/api/auth/profile` | Private | Update user's full name (email read-only) |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |

### Venues (`/api/venues`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/venues` | Public | List venues with search, city, sport, maxPrice, and price sort |
| `GET` | `/api/venues/featured` | Public | 4 featured grounds for homepage |
| `GET` | `/api/venues/:id` | Public | Get single ground details |
| `GET` | `/api/venues/:id/slots` | Public | Hourly slot availability for 14-day rolling window (IST) |
| `POST` | `/api/venues` | Admin | Create a new sports ground |
| `PUT` | `/api/venues/:id` | Admin | Edit existing venue attributes |
| `DELETE`| `/api/venues/:id` | Admin | Safe deletion (deactivates if booking history exists) |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/bookings` | Private | Reserve slot with database concurrency check (409 on clash) |
| `GET` | `/api/bookings/my` | Private | Get user's upcoming, past, and cancelled bookings |
| `GET` | `/api/bookings/:id` | Private (Owner/Admin) | Retrieve printable booking ticket |
| `PUT` | `/api/bookings/:id/cancel` | Private (Owner/Admin) | Cancel reservation and release slot in real-time |

### Administration (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/stats` | Admin | Database counts: venues, users, bookings, expected volume |
| `GET` | `/api/admin/bookings` | Admin | Filterable inspection table of all system bookings |
| `GET` | `/api/admin/users` | Admin | List all registered user accounts |

### Health Check (`/api/health`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Database-aware service status and uptime seconds |

---

## 8. Where CRUD Operations are Demonstrated

| Entity | Create (C) | Read (R) | Update (U) | Delete / Deactivate (D) |
|---|---|---|---|---|
| **Venues** | Admin Dashboard modal (`POST /api/venues`) | Explore page & details page (`GET /api/venues`) | Admin Dashboard edit modal (`PUT /api/venues/:id`) | Admin Dashboard: permanent delete if 0 bookings, or safe deactivation (`DELETE /api/venues/:id`) |
| **Bookings**| Booking review page (`POST /api/bookings`) | My Bookings & Ticket page (`GET /api/bookings/my`) | N/A (immutable snapshot for historical audit) | My Bookings cancellation dialog (`PUT /api/bookings/:id/cancel` releases slot) |
| **User Profile** | Registration page (`POST /api/auth/signup`) | Profile page & Navbar (`GET /api/auth/me`) | Profile update form (`PUT /api/auth/profile`) | N/A |

---

## 9. Automated Testing & Concurrency Verification

PlayArena includes automated tests using Node's native test runner (`node:test`) and a dedicated test database (`playarena_test`):

```powershell
cd server
npm test
```

### Verified Test Assertions:
1. **Concurrency Test (`tests/concurrency.test.js`)**: Executes two simultaneous booking requests in parallel (`Promise.all`) for the exact same slot. **Result:** Exactly 1 wins (`201 Created`) and 1 receives `HTTP 409 Conflict`.
2. **Duplicate Email Rejection**: Rejects duplicate signup with `HTTP 400`.
3. **Invalid Credentials**: Rejects bad password with `HTTP 401`.
4. **Auth Persistence**: Restores session from HttpOnly cookie.
5. **Role Tampering Protection**: Ignores client-supplied `role: 'ADMIN'` during public signup.
6. **Owner Isolation**: Verifies User B receives `HTTP 403 Forbidden` if attempting to view or cancel User A's ticket.
7. **Slot Release**: Confirms that cancelling a booking changes status to `CANCELLED` and makes the slot `AVAILABLE` again.

---

## 10. Troubleshooting Common Issues

1. **Port 5000 or 5173 already in use:**
   ```powershell
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
   Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
   ```
2. **MongoDB Connection Refused (`ECONNREFUSED 127.0.0.1:27017`):**
   - Ensure the MongoDB service is running:
     ```powershell
     Start-Service -Name MongoDB
     ```
3. **Vite Proxy connection error (`ECONNREFUSED`):**
   - Make sure the server is started (`npm run dev` in `server`) before interacting with the frontend.

---

## 11. Folder Renaming Instructions

Per college requirements, your final submitted outer directory must be named with your PRN only:
```text
25070521305/
├── client/
├── server/
├── README.md
└── DEMO_GUIDE.md
```

### How to Rename the Workspace After Work Finishes:
1. Close your code editor or IDE.
2. In Windows File Explorer, navigate to your Desktop: `C:\Users\vedan\Desktop`.
3. Right-click the folder `25070521305 Flexi CA-3` and select **Rename**.
4. Rename it to:
   ```text
   25070521305
   ```
5. Verify that `client`, `server`, `README.md`, and `DEMO_GUIDE.md` are located directly inside `C:\Users\vedan\Desktop\25070521305`.

---

## 12. GitHub Submission Steps (`<PRN>-CA-03`)

1. Open PowerShell inside your renamed folder (`25070521305`):
   ```powershell
   cd C:\Users\vedan\Desktop\25070521305
   git init
   git add .
   git commit -m "feat: complete PlayArena sports turf and court booking system for CA-03"
   ```
2. Create a new public repository on GitHub named:
   ```text
   25070521305-CA-03
   ```
3. Link and push your repository:
   ```powershell
   git branch -M main
   git remote add origin https://github.com/<your-username>/25070521305-CA-03.git
   git push -u origin main
   ```
4. **Verify Signed-Out Access:**
   - Open an Incognito/Private browser window.
   - Visit `https://github.com/<your-username>/25070521305-CA-03`.
   - Confirm that the repository is publicly viewable and does not contain `node_modules` or `.env` files.
