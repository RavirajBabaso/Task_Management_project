import http from 'http';
import { Server } from 'socket.io';
import app from './app';
import { env } from './config/env';

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: env.frontendUrl,
    credentials: true
  }
});

io.on('connection', (socket) => {
  socket.emit('connected', { socketId: socket.id });
});

server.listen(env.port, () => {
  console.log(`API server running on port ${env.port}`);
});
