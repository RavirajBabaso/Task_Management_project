import request from 'supertest';
import app from './setup';
import { User, Approval, Department } from '../../models';

describe('Approvals Integration Tests', () => {
  let chairmanUser: User;
  let staffUser: User;
  let department: Department;
  let chairmanToken: string;
  let staffToken: string;
  let approval: Approval;

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

    // Create a test approval
    approval = await (Approval as any).create({
      type: 'BUDGET',
      title: 'Budget Request for Q1',
      details: 'Additional budget for project expenses',
      amount: '50000.00',
      requested_by: staffUser.id,
      status: 'PENDING'
    });
  });

  describe('POST /api/approvals', () => {
    it('should create approval when authenticated', async () => {
      const approvalData = {
        type: 'PURCHASE',
        title: 'New Equipment Purchase',
        details: 'Purchase of laptops for new team members',
        amount: '25000.00'
      };

      const response = await request(app)
        .post('/api/approvals')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(approvalData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.type).toBe('PURCHASE');
      expect(response.body.data.title).toBe('New Equipment Purchase');
      expect(response.body.data.status).toBe('PENDING');
      expect(response.body.data.requested_by).toBe(staffUser.id);
      expect(response.body.message).toBe('Approval request submitted successfully');
    });

    it('should return 401 when not authenticated', async () => {
      const approvalData = {
        type: 'POLICY',
        title: 'New Policy Request',
        details: 'Request for new work from home policy'
      };

      const response = await request(app)
        .post('/api/approvals')
        .send(approvalData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication is required');
    });

    it('should return 400 for invalid approval type', async () => {
      const approvalData = {
        type: 'INVALID_TYPE',
        title: 'Invalid Type Request',
        details: 'This should fail'
      };

      const response = await request(app)
        .post('/api/approvals')
        .set('Authorization', `Bearer ${staffToken}`)
        .send(approvalData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Validation error');
    });
  });

  describe('PUT /api/approvals/:id', () => {
    it('should allow Chairman to approve pending approval', async () => {
      const response = await request(app)
        .put(`/api/approvals/${approval.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send({ status: 'APPROVED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
      expect(response.body.data.approved_by).toBe(chairmanUser.id);
      expect(response.body.message).toBe('Approval approved successfully');

      // Verify approval is updated in database
      await approval.reload();
      expect(approval.status).toBe('APPROVED');
      expect(approval.approved_by).toBe(chairmanUser.id);
    });

    it('should allow Chairman to reject pending approval', async () => {
      const response = await request(app)
        .put(`/api/approvals/${approval.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send({ status: 'REJECTED' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('REJECTED');
      expect(response.body.data.approved_by).toBe(chairmanUser.id);
      expect(response.body.message).toBe('Approval rejected successfully');
    });

    it('should return 403 for non-Chairman users', async () => {
      const response = await request(app)
        .put(`/api/approvals/${approval.id}`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({ status: 'APPROVED' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied. Chairman role required.');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .put(`/api/approvals/${approval.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Status must be APPROVED or REJECTED');
    });

    it('should return 400 for already processed approval', async () => {
      // First approve the approval
      await request(app)
        .put(`/api/approvals/${approval.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send({ status: 'APPROVED' });

      // Try to approve again
      const response = await request(app)
        .put(`/api/approvals/${approval.id}`)
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send({ status: 'REJECTED' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Approval has already been processed');
    });

    it('should return 404 for non-existent approval', async () => {
      const response = await request(app)
        .put('/api/approvals/999')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .send({ status: 'APPROVED' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Approval not found');
    });
  });

  describe('GET /api/approvals', () => {
    it('should return all approvals when authenticated as Chairman', async () => {
      const response = await request(app)
        .get('/api/approvals')
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.message).toBe('Approvals retrieved successfully');
    });

    it('should filter approvals by status', async () => {
      const response = await request(app)
        .get('/api/approvals')
        .query({ status: 'PENDING' })
        .set('Authorization', `Bearer ${chairmanToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.every((app: Approval) => app.status === 'PENDING')).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      const response = await request(app)
        .get('/api/approvals')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Authentication is required');
    });
  });
});