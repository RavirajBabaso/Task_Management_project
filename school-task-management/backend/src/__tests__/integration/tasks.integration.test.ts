import request from 'supertest';
import app from './setup';
import { User, Task, Department } from '../../models';

describe('Tasks Integration Tests', () => {
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

  describe('POST /api/tasks', () => {
    it('should return 403 for non-Chairman users', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          title: 'Test Task',
          description: 'Test description',
          assigned_to: staffUser.id,
          priority: 'HIGH',
          due_date: new Date().toISOString()
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Chairman role required.');
    });

    it('should create task when authenticated as Chairman', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        assigned_to: staffUser.id,
        department_id: department.id,
        priority: 'HIGH',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.title).toBe('Test Task');
      expect(response.body.data.assigned_to).toBe(staffUser.id);
      expect(response.body.data.assigned_by).toBe(chairmanUser.id);
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.message).toBe('Task created successfully');
    });

    it('should create task with default department when not specified', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test description',
        assigned_to: staffUser.id,
        priority: 'MEDIUM',
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Test Task');
    });
  });

  describe('GET /api/tasks/my-tasks', () => {
    let task1: Task;
    let task2: Task;

    beforeEach(async () => {
      // Create tasks assigned to different users
      task1 = await (Task as any).create({
        title: 'Task for Staff',
        description: 'Staff task',
        assigned_by: chairmanUser.id,
        assigned_to: staffUser.id,
        department_id: department.id,
        priority: 'HIGH',
        status: 'PENDING',
        start_date: new Date(),
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
      });

      task2 = await (Task as any).create({
        title: 'Task for Chairman',
        description: 'Chairman task',
        assigned_by: chairmanUser.id,
        assigned_to: chairmanUser.id,
        department_id: department.id,
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        start_date: new Date(),
        due_date: new Date(Date.now() + 48 * 60 * 60 * 1000)
      });
    });

    it('should return only tasks assigned to the logged-in user', async () => {
      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${staffToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(task1.id);
      expect(response.body.data[0].title).toBe('Task for Staff');
      expect(response.body.data[0].assigned_to).toBe(staffUser.id);
    });

    it('should return empty array when user has no tasks', async () => {
      // Create another staff user
      const otherStaff = await (User as any).create({
        name: 'Other Staff',
        email: 'other@example.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/JOgFZzZzZzZzZzZ', // 'password'
        role: 'HR',
        department_id: department.id,
        is_active: true
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password'
        });

      const response = await request(app)
        .get('/api/tasks/my-tasks')
        .set('Authorization', `Bearer ${otherLogin.body.data.accessToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task: Task;

    beforeEach(async () => {
    task = await (Task as any).create({
      title: 'Test Task',
      description: 'Test description',
      assigned_by: chairmanUser.id,
      assigned_to: staffUser.id,
      department_id: department.id,
      priority: 'HIGH',
      status: 'PENDING',
      start_date: new Date(),
      due_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    });

    it('should allow assignee to update task status', async () => {
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'IN_PROGRESS'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
      expect(response.body.message).toBe('Task updated successfully');
    });

    it('should return 403 when non-assignee tries to update task', async () => {
      // Create another staff user
      const otherStaff = await (User as any).create({
        name: 'Other Staff',
        email: 'other@example.com',
        password_hash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/JOgFZzZzZzZzZzZ', // 'password'
        role: 'HR',
        department_id: department.id,
        is_active: true
      });

      const otherLogin = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password'
        });

      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${otherLogin.body.data.accessToken}`)
        .send({
          status: 'IN_PROGRESS'
        })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Only assigned user can update this task.');
    });

    it('should allow Chairman to update any task', async () => {
      const response = await request(app)
        .put(`/api/tasks/${task.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send({
          status: 'COMPLETED',
          comment: 'Completed by chairman'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
    });

    it('should return 404 for non-existent task', async () => {
      const response = await request(app)
        .put('/api/tasks/999')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'IN_PROGRESS'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Task not found');
    });
  });
});