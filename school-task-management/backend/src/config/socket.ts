import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { env } from './env';

export let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL ?? env.frontendUrl,
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    socket.emit('connected', { socketId: socket.id });
  });

  return io;
};
