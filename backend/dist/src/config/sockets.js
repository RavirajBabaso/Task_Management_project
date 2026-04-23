"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitToAll = exports.emitToUser = exports.initSocket = exports.io = void 0;
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const userSockets = new Map();
const initSocket = (server) => {
    exports.io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
            credentials: true
        }
    });
    exports.io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await User_1.User.findByPk(decoded.id);
            if (!user) {
                return next(new Error('User not found'));
            }
            socket.data.user = user;
            next();
        }
        catch (error) {
            next(new Error('Authentication error'));
        }
    });
    exports.io.on('connection', (socket) => {
        const userId = socket.data.user.id;
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} connected with socket ${socket.id}`);
        socket.on('disconnect', () => {
            userSockets.delete(userId);
            console.log(`User ${userId} disconnected`);
        });
    });
    return exports.io;
};
exports.initSocket = initSocket;
const emitToUser = (userId, event, data) => {
    const socketId = userSockets.get(userId);
    if (socketId) {
        exports.io.to(socketId).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
const emitToAll = (event, data) => {
    exports.io.emit(event, data);
};
exports.emitToAll = emitToAll;
