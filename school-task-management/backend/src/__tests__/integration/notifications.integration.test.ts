import request from 'supertest';
import app from './setup';
import { User, Notification, Task, Department } from '../../models';

describe('Notifications Integration Tests', () => {
  let chairmanUser: User;
  let staffUser: User;
  let department: Department;
  let chairmanToken: string;
  let staffToken: string;
  let task: Task;

  beforeEach(async () => {
    // Create test department
    department = await (Department as any).create({
      name: 'Test Department',
      description: 'Test department description'
    });

    // Create chairman user
    chairmanUser = await (User as any).create({
      name: 'Chairman User',
      email: 'chairman@example.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/JOgFZzZzZzZzZzZ', // 'password'
      role: 'CHAIRMAN',
      department_id: department.id,
      is_active: true
    });

    // Create staff user
    staffUser = await (User as any).create({
      name: 'Staff User',
      email: 'staff@example.com',
      password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/JOgFZzZzZzZzZzZ', // 'password'
      role: 'IT',
      department_id: department.id,
      is_active: true
    });

    // Login to get tokens
    const chairmanLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'chairman@example.com',
        password: 'password'
      });

    chairmanToken = chairmanLogin.body.data.accessToken;

    const staffLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'staff@example.com',
        password: 'password'
      });

    staffToken = staffLogin.body.data.accessToken;

    // Create a task that will generate notifications
    task = await (Task as any).create({
      title: 'Test Task for Notifications',
      description: 'Task to test notifications',
      assigned_by: chairmanUser.id,
      assigned_to: staffUser.id,
      department_id: department.id,
      priority: 'HIGH',
      status: 'PENDING',
      start_date: new Date(),
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
  });

  describe('GET /api/notifications', () => {
    it('should return notifications for the logged-in user only', async () => {
      // The task creation should have created a notification for the staff user
      const staffNotifications = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(staffNotifications.body.success).toBe(true);
      expect(Array.isArray(staffNotifications.body.data)).toBe(true);
      expect(staffNotifications.body.data.length).toBeGreaterThanOrEqual(1);

      // Check that all returned notifications belong to the staff user
      staffNotifications.body.data.forEach((notification: Notification) => {
        expect(notification.user_id).toBe(staffUser.id);
      });

      expect(staffNotifications.body.message).toBe('Notifications retrieved successfully');
    });

    it('should return empty array when user has no notifications', async () => {
      // Create another user with no tasks/notifications
      const newUser = await (User as any).create({
        name: 'New User',
        email: 'newuser@example.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/JOgFZzZzZzZzZzZ', // 'password'
        role: 'HR',
        department_id: department.id,
        is_active: true
      });

      const newUserLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'password'
        });

      const response = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${newUserLogin.body.data.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
      expect(response.body.message).toBe('Notifications retrieved successfully');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/notifications')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication is required');
    });

    it('should mark notifications as read when requested', async () => {
      // Get notifications first
      const getResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      const notificationId = getResponse.body.data[0]?.id;
      if (notificationId) {
        // Mark notification as read
        const markReadResponse = await request(app)
          .put(`/api/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${staffToken}`)
          .expect(200);

        expect(markReadResponse.body.success).toBe(true);
        expect(markReadResponse.body.message).toBe('Notification marked as read');

        // Verify notification is marked as read
        await Notification.findByPk(notificationId).then(notification => {
          expect(notification?.is_read).toBe(true);
        });
      }
    });

    it('should allow marking all notifications as read', async () => {
      // Create multiple notifications by updating the task status
      await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'IN_PROGRESS' });

      // Mark all notifications as read
      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('All notifications marked as read');

      // Verify all notifications are marked as read
      const notifications = await Notification.findAll({
        where: { user_id: staffUser.id }
      });

      notifications.forEach(notification => {
        expect(notification.is_read).toBe(true);
      });
    });
  });

  describe('PUT /api/notifications/:id/read', () => {
    it('should mark specific notification as read', async () => {
      // Get a notification ID first
      const getResponse = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${staffToken}`);

      const notificationId = getResponse.body.data[0]?.id;

      if (notificationId) {
        const response = await request(app)
          .put(`/api/notifications/${notificationId}/read`)
          .set('Authorization', `Bearer ${staffToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.message).toBe('Notification marked as read');
      }
    });

    it('should return 404 for non-existent notification', async () => {
      const response = await request(app)
        .put('/api/notifications/999/read')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Notification not found');
    });

    it('should return 403 for notification belonging to another user', async () => {
      // Get chairman's notifications (should be empty initially)
      const chairmanNotifications = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${chairmanToken}`);

      if (chairmanNotifications.body.data.length === 0) {
        // If chairman has no notifications, try to access staff's notification
        const staffNotifications = await request(app)
          .get('/api/notifications')
          .set('Authorization', `Bearer ${staffToken}`);

        const notificationId = staffNotifications.body.data[0]?.id;

        if (notificationId) {
          // Create chairman token
          const chairmanLogin = await request(app)
            .post('/api/auth/login')
            .send({
              email: 'chairman@example.com',
              password: 'password'
            });

          const response = await request(app)
            .put(`/api/notifications/${notificationId}/read`)
            .set('Authorization', `Bearer ${chairmanLogin.body.data.accessToken}`)
            .expect(403);

          expect(response.body.success).toBe(false);
          expect(response.body.message).toBe('Access denied. You can only modify your own notifications.');
        }
      }
    });
  });

  describe('PUT /api/notifications/read-all', () => {
    it('should mark all user notifications as read', async () => {
      // Create additional notifications
      await (Notification as any).create({
        user_id: staffUser.id,
        type: 'TASK_UPDATED',
        message: 'Additional notification',
        task_id: task.id,
        is_read: false
      });

      const response = await request(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('All notifications marked as read');
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .put('/api/notifications/read-all')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication is required');
    });
  });
});