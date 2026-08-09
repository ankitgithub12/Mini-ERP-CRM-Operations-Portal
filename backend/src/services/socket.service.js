let io = null;

const init = (socketIoInstance) => {
  io = socketIoInstance;
  io.on('connection', (socket) => {
    console.log(`New socket client connected: ${socket.id}`);

    // Client emits this event to join their role-specific room
    socket.on('join_role_room', (role) => {
      if (role) {
        // Leave any previously joined rooms to prevent duplicate alerts
        const currentRooms = Array.from(socket.rooms);
        currentRooms.forEach((room) => {
          if (room.startsWith('role:')) {
            socket.leave(room);
          }
        });

        socket.join(`role:${role}`);
        console.log(`Socket client ${socket.id} joined room: role:${role}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
};

/**
 * Sends a real-time notification to clients.
 * @param {string|string[]} roles - Single role string, array of roles, or 'all'
 * @param {string} type - Notification type (e.g. LOW_STOCK, NEW_CHALLAN)
 * @param {string} message - User-facing display text
 */
const sendNotification = (roles, type, message) => {
  if (!io) {
    console.warn('[WARN] Socket.io not initialized. Skipping notification.');
    return;
  }

  const payload = {
    id: `${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    message,
    timestamp: new Date().toISOString(),
  };

  console.log(`Broadcasting notification [${type}]: "${message}" to roles:`, roles);

  if (roles === 'all') {
    io.emit('notification', payload);
  } else if (Array.isArray(roles)) {
    roles.forEach((role) => {
      io.to(`role:${role}`).emit('notification', payload);
    });
  } else if (typeof roles === 'string') {
    io.to(`role:${roles}`).emit('notification', payload);
  }
};

module.exports = {
  init,
  sendNotification,
};
