import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { addNotification } from '../store/notificationSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Announcement, Notification } from '../types/notification.types';
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

const normalizeAnnouncementNotification = (
  announcement: Announcement,
  userId: number | undefined
): Notification => ({
  id: announcement.id,
  user_id: userId ?? 0,
  type: 'ANNOUNCEMENT',
  message: announcement.message,
  task_id: null,
  is_read: false,
  created_at: announcement.created_at
});

export const useSocket = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { token, user } = useAppSelector((state) => state.auth);

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

    socket.on('notification:new', (notification: Notification) => {
      dispatch(addNotification(notification));
      toast.success(notification.message);
    });

    socket.on('task:updated', (payload: SocketTaskPayload | Task) => {
      const task = resolveTaskPayload(payload);
      if (task) {
        void queryClient.invalidateQueries({ queryKey: ['tasks'] });
        void queryClient.invalidateQueries({ queryKey: ['task', task.id] });
      }
    });

    socket.on('announcement:new', (announcement: Announcement) => {
      dispatch(addNotification(normalizeAnnouncementNotification(announcement, user?.id)));
    });

    return () => {
      socket.disconnect();
    };
  }, [dispatch, queryClient, token, user?.id]);
};
