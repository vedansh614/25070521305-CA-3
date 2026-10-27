let io = null;

function initSocket(server) {
  const { Server } = require('socket.io');
  const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

  io = new Server(server, {
    cors: {
      origin: allowedOrigin,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    // Client can join a specific venue date room or general updates
    socket.on('join_venue', (data) => {
      if (data && data.venueId) {
        const roomName = `venue:${data.venueId}`;
        socket.join(roomName);
      }
    });

    socket.on('leave_venue', (data) => {
      if (data && data.venueId) {
        const roomName = `venue:${data.venueId}`;
        socket.leave(roomName);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  console.log('[Socket.IO] Real-time engine initialized');
  return io;
}

function getIO() {
  return io;
}

/**
 * Broadcast slot availability update to all interested clients
 * Never broadcasts private customer or user info
 */
function broadcastSlotUpdate({ venueId, bookingDate, slotLabel, startTime, status }) {
  if (!io) return;

  const payload = {
    venueId: venueId.toString(),
    bookingDate,
    slotLabel,
    startTime: startTime instanceof Date ? startTime.toISOString() : startTime,
    status, // 'BOOKED' or 'AVAILABLE'
    timestamp: new Date().toISOString(),
  };

  // Broadcast to venue room and also global broadcast so Explore page or details page can react
  io.to(`venue:${venueId}`).emit('availability_update', payload);
  io.emit('global_availability_update', payload);
}

module.exports = {
  initSocket,
  getIO,
  broadcastSlotUpdate,
};
