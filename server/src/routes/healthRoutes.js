const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { isDbHealthy } = require('../config/db');

router.get('/', (req, res) => {
  const dbConnected = isDbHealthy();
  const statusCode = dbConnected ? 200 : 503;

  return res.status(statusCode).json({
    status: dbConnected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    service: 'PLAYARENA API',
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState,
    },
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

module.exports = router;
