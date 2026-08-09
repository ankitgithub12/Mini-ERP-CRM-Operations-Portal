const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { port, nodeEnv, clientUrl } = require('./config/env');
const socketService = require('./services/socket.service');

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

socketService.init(io);

server.listen(port, () => {
  console.log(`\n🚀 Server running in ${nodeEnv} mode on port ${port}`);
  console.log(`📡 API: http://localhost:${port}/api`);
  console.log(`❤️  Health: http://localhost:${port}/api/health\n`);
});
