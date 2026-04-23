import { Op } from 'sequelize';
import {
  Department,
  Notification,
  Task,
  TaskHistory,
  User
} from '../models';
import {
  createTask,
  updateTaskStatus,
  checkAndFlagDelayedTasks,
  getTasksWithFilters
} from '../services/taskService';

// Mock the models
const mockTask = {
  id: 1,
  title: 'Test Task',
  description: 'Test description',
  assigned_by: 1,
  assigned_to: 2,
  department_id: 1,
  priority: 'HIGH',
  status: 'PENDING',
  start_date: new Date(),
  due_date: new Date(),
  attachment_path: null,
  completed_at: null,
  save: jest.fn(),
  assignedBy: { id: 1, name: 'Creator', email: 'creator@test.com', role: 'CHAIRMAN' },
  assignedTo: { id: 2, name: 'Assignee', email: 'assignee@test.com', role: 'STAFF', department_id: 1 },
  department: { id: 1, name: 'IT Department', description: 'IT Department' },
  history: []
};

const mockUser = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  role: 'STAFF'
};

describe('Task Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createTask', () => {
    it('should create a task and TaskHistory entry with status PENDING', async () => {
      const payload = {
        title: 'Test Task',
        description: 'Test description',
        assigned_to: 2,
        department_id: 1,
        priority: 'HIGH' as const,
        due_date: new Date(),
        start_date: new Date()
      };

      (Task.create as jest.Mock).mockResolvedValue(mockTask);
      (TaskHistory.create as jest.Mock).mockResolvedValue({});
      (Notification.create as jest.Mock).mockResolvedValue({ id: 1, created_at: new Date() });
      (User.findByPk as jest.Mock).mockResolvedValue(mockUser);
      (Task.findByPk as jest.Mock).mockResolvedValue(mockTask);

      const result = await createTask(payload, 1);

      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Task',
          assigned_by: 1,
          assigned_to: 2,
          status: 'PENDING'
        }),
        expect.any(Object)
      );

      expect(TaskHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          task_id: 1,
          updated_by: 1,
          old_status: null,
          new_status: 'PENDING',
          comment: 'Task created'
        }),
        expect.any(Object)
      );

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 2,
          type: 'TASK_ASSIGNED',
          message: 'New task assigned: Test Task',
          task_id: 1,
          is_read: false
        })
      );

      expect(result).toBeDefined();
    });
  });

  describe('updateTaskStatus', () => {
    it('should insert correct old/new status in history', async () => {
      const taskId = 1;
      const newStatus = 'COMPLETED' as const;
      const updatedBy = 1;

      (Task.findByPk as jest.Mock).mockResolvedValue({ ...mockTask, status: 'IN_PROGRESS' });
      (TaskHistory.create as jest.Mock).mockResolvedValue({});
      (Notification.create as jest.Mock).mockResolvedValue({ id: 1, created_at: new Date() });

      const result = await updateTaskStatus(taskId, newStatus, updatedBy, 'Task completed');

      expect(Task.findByPk).toHaveBeenCalledWith(taskId, expect.any(Object));
      expect(TaskHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          task_id: 1,
          updated_by: 1,
          old_status: 'IN_PROGRESS',
          new_status: 'COMPLETED',
          comment: 'Task completed'
        }),
        expect.any(Object)
      );

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 2,
          type: 'TASK_UPDATED',
          message: 'Task "Test Task" updated to COMPLETED',
          task_id: 1,
          is_read: false
        })
      );

      expect(result).toBeDefined();
    });

    it('should return null if task not found', async () => {
      (Task.findByPk as jest.Mock).mockResolvedValue(null);

      const result = await updateTaskStatus(999, 'COMPLETED', 1);

      expect(result).toBeNull();
    });
  });

  describe('checkAndFlagDelayedTasks', () => {
    it('should only flag tasks past due date with non-completed status', async () => {
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 1);

      const mockDelayedTask = {
        ...mockTask,
        id: 2,
        status: 'IN_PROGRESS',
        due_date: pastDueDate,
        assigned_by: 1,
        save: jest.fn()
      };

      const mockCompletedTask = {
        ...mockTask,
        id: 3,
        status: 'COMPLETED',
        due_date: pastDueDate,
        save: jest.fn()
      };

      (Task.findAll as jest.Mock).mockResolvedValue([mockDelayedTask]);
      (TaskHistory.create as jest.Mock).mockResolvedValue({});
      (Notification.create as jest.Mock).mockResolvedValue({ id: 1, created_at: new Date() });

      const result = await checkAndFlagDelayedTasks();

      expect(Task.findAll).toHaveBeenCalledWith({
        where: {
          status: {
            [Op.notIn]: ['COMPLETED', 'DELAYED']
          },
          due_date: {
            [Op.lt]: expect.any(Date)
          }
        },
        transaction: expect.any(Object)
      });

      expect(mockDelayedTask.save).toHaveBeenCalled();
      expect(TaskHistory.create).toHaveBeenCalledWith(
        expect.objectContaining({
          task_id: 2,
          old_status: 'IN_PROGRESS',
          new_status: 'DELAYED',
          comment: 'Task automatically flagged as delayed'
        }),
        expect.any(Object)
      );

      expect(Notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 2,
          type: 'TASK_DELAYED',
          message: 'Task "Test Task" is delayed',
          task_id: 2,
          is_read: false
        })
      );

      expect(result).toBe(1);
    });

    it('should not flag completed tasks', async () => {
      const pastDueDate = new Date();
      pastDueDate.setDate(pastDueDate.getDate() - 1);

      const mockCompletedTask = {
        ...mockTask,
        status: 'COMPLETED',
        due_date: pastDueDate
      };

      (Task.findAll as jest.Mock).mockResolvedValue([]);

      const result = await checkAndFlagDelayedTasks();

      expect(result).toBe(0);
    });
  });

  describe('getTasksWithFilters', () => {
    it('should apply all filter combinations correctly', async () => {
      const filters = {
        assigned_to: 2,
        department_id: 1,
        status: 'PENDING' as const,
        priority: 'HIGH' as const,
        from: '2024-01-01',
        to: '2024-01-31'
      };

      const mockTasks = [mockTask];
      (Task.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getTasksWithFilters(filters);

      expect(Task.findAll).toHaveBeenCalledWith({
        where: expect.objectContaining({
          assigned_to: 2,
          department_id: 1,
          status: 'PENDING',
          priority: 'HIGH',
          due_date: {
            [Op.gte]: new Date('2024-01-01'),
            [Op.lte]: new Date('2024-01-31')
          }
        }),
        include: expect.any(Array),
        order: [['due_date', 'ASC']]
      });

      expect(result).toEqual(mockTasks);
    });

    it('should handle partial filters', async () => {
      const filters = {
        status: 'COMPLETED' as const
      };

      const mockTasks = [mockTask];
      (Task.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getTasksWithFilters(filters);

      expect(Task.findAll).toHaveBeenCalledWith({
        where: { status: 'COMPLETED' },
        include: expect.any(Array),
        order: [['due_date', 'ASC']]
      });

      expect(result).toEqual(mockTasks);
    });

    it('should handle empty filters', async () => {
      const mockTasks = [mockTask];
      (Task.findAll as jest.Mock).mockResolvedValue(mockTasks);

      const result = await getTasksWithFilters({});

      expect(Task.findAll).toHaveBeenCalledWith({
        where: {},
        include: expect.any(Array),
        order: [['due_date', 'ASC']]
      });

      expect(result).toEqual(mockTasks);
    });
  });
});