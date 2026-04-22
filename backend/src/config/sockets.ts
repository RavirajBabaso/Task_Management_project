import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const userSockets = new Map<number, string>();

export const initializeSocket = (io: SocketServer) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: number };
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.user.id;
    userSockets.set(userId, socket.id);

    console.log(`User ${userId} connected with socket ${socket.id}`);

    socket.on('disconnect', () => {
      userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    });
  });
};

export const emitToUser = (userId: number, event: string, data: any) => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    const io = require('../app').io; // Assuming io is exported from app.ts
    io.to(socketId).emit(event, data);
  }
};