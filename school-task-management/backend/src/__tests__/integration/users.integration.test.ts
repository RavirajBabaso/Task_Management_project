import request from 'supertest';
import app from './setup';
import { User, Department } from '../../models';

describe('Users Integration Tests', () => {
  let chairmanUser: User;
  let staffUser: User;
  let department: Department;
  let chairmanToken: string;
  let staffToken: string;

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
  });

  describe('GET /api/users', () => {
    it('should return 403 for non-Chairman users', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Chairman role required.');
    });

    it('should return users list when authenticated as Chairman', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2); // chairman and staff
      expect(response.body.message).toBe('Users retrieved successfully');
    });

    it('should filter users by department', async () => {
      const otherDept = await (Department as any).create({
        name: 'Other Department',
        description: 'Other department description'
      });
      await (User as any).create({
        name: 'Other Dept User',
        email: 'other@example.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/JOgFZzZzZzZzZzZ', // 'password'
        role: 'IT',
        department_id: otherDept.id,
        is_active: true
      });

      const response = await request(app)
        .get('/api/users')
        .query({ department_id: department.id })
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(2); // chairman and staff from same dept
      expect(response.body.data.every((user: User) => user.department_id === department.id)).toBe(true);
    });

    it('should filter users by role', async () => {
      const response = await request(app)
        .get('/api/users')
        .query({ role: 'CHAIRMAN' })
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.data[0].role).toBe('CHAIRMAN');
    });
  });

  describe('POST /api/users', () => {
    it('should create user when authenticated as Chairman', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'newpassword123',
        role: 'IT',
        department_id: department.id
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send(newUserData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('New User');
      expect(response.body.data.email).toBe('newuser@example.com');
      expect(response.body.data.role).toBe('STAFF');
      expect(response.body.data.department_id).toBe(department.id);
      expect(response.body.message).toBe('User created successfully');

      // Verify user can login with created credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'newuser@example.com',
          password: 'newpassword123'
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should return 403 for non-Chairman users', async () => {
      const newUserData = {
        name: 'New User',
        email: 'newuser@example.com',
        password: 'newpassword123',
        role: 'IT',
        department_id: department.id
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(newUserData)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Chairman role required.');
    });

    it('should return 400 for duplicate email', async () => {
      const duplicateUserData = {
        name: 'Duplicate User',
        email: 'staff@example.com', // Already exists
        password: 'password123',
        role: 'IT',
        department_id: department.id
      };

      const response = await request(app)
        .post('/api/users')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send(duplicateUserData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should soft-delete user when authenticated as Chairman', async () => {
      const response = await request(app)
        .delete(`/api/users/${staffUser.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deactivated successfully');

      // Verify user is deactivated
      await staffUser.reload();
      expect(staffUser.is_active).toBe(false);

      // Verify deactivated user cannot login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'staff@example.com',
          password: 'password'
        })
        .expect(401);

      expect(loginResponse.body.success).toBe(false);
    });

    it('should return 403 for non-Chairman users', async () => {
      const response = await request(app)
        .delete(`/api/users/${chairmanUser.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Chairman role required.');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .delete('/api/users/999')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });

    it('should prevent deactivating self', async () => {
      const response = await request(app)
        .delete(`/api/users/${chairmanUser.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Cannot deactivate your own account');
    });
  });
});