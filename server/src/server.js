require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { connectDB } = require('./config/db');
const { initSocket } = require('./config/socket');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const venueRoutes = require('./routes/venueRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const server = http.createServer(app);

// Initialize real-time Socket.IO
initSocket(server);

// Allowed origin for client with credentials
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(cookieParser());

// Request logger for local development
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
  });
}

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all for undefined API routes
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.method} ${req.originalUrl}' not found.`,
  });
});

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`PLAYARENA Sports Turf & Court Booking Backend`);
      console.log(`Server running at: http://localhost:${PORT}`);
      console.log(`Client Origin: ${clientOrigin}`);
      console.log(`Database: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/playarena'}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('[Startup Error] Failed to boot server:', error);
    process.exit(1);
  }
}

// Only start listening if this file was executed directly (allows test runner imports)
if (require.main === module) {
  startServer();
}

module.exports = { app, server };
