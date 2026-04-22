import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { addNotification } from '../store/notificationSlice';
import { upsertTask } from '../store/taskSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Notification } from '../types/notification.types';
import type { Task } from '../types/task.types';

interface SocketTaskPayload {
  task?: Task;
}

const resolveTaskPayload = (payload: SocketTaskPayload | Task) => {
  if ('id' in payload) {
    return payload;
  }

  return payload.task;
};

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) {
      return undefined;
    }

    const socketBaseUrl = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api').replace(
      /\/api\/?$/,
      ''
    );
    const socket = io(socketBaseUrl, {
      auth: { token },
      transports: ['websocket']
    });

    socket.on('task:updated', (payload: SocketTaskPayload | Task) => {
      const task = resolveTaskPayload(payload);
      if (task) {
        dispatch(upsertTask(task));
      }
    });

    socket.on('task:assigned', (payload: SocketTaskPayload | Task) => {
      const task = resolveTaskPayload(payload);
      if (task) {
        dispatch(upsertTask(task));
      }
    });

    socket.on('notification:new', (notification: Notification) => {
      dispatch(addNotification(notification));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, token]);
};
