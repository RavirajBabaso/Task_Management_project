// Set up test environment variables
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.NODE_ENV = 'test';

// Mock database before importing app
import { Sequelize } from 'sequelize-typescript';

const testSequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

// Mock the database module before importing app
jest.mock('../../config/database', () => ({
  sequelize: testSequelize
}));

// Mock Redis
jest.mock('../../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
}));

// Mock external services
jest.mock('../../services/emailService', () => ({
  sendTaskAssignedEmail: jest.fn().mockResolvedValue(undefined),
  sendEscalationEmail: jest.fn().mockResolvedValue(undefined)
}));

// Mock socket
jest.mock('../../config/socket', () => ({
  initSocket: jest.fn(),
  emitToUser: jest.fn()
}));

// Mock cron jobs
jest.mock('../../jobs/delayAlertJob', () => ({
  start: jest.fn(),
  stop: jest.fn()
}));

jest.mock('../../jobs/dailyReportJob', () => ({
  start: jest.fn(),
  stop: jest.fn()
}));

jest.mock('../../jobs/weeklyReportJob', () => ({
  start: jest.fn(),
  stop: jest.fn()
}));

// Mock PDF and Excel generators
jest.mock('../../utils/pdfGenerator', () => ({
  generateTaskReport: jest.fn().mockResolvedValue('/path/to/report.pdf')
}));

jest.mock('../../utils/excelGenerator', () => ({
  generateTaskExcel: jest.fn().mockResolvedValue('/path/to/report.xlsx')
}));

// Now import app after all mocks are set up
import app from '../../app';

// Set up database for tests
beforeAll(async () => {
  // Import models dynamically
  const {
    Announcement,
    Approval,
    Department,
    Notification,
    Report,
    Task,
    TaskHistory,
    User
  } = await import('../../models');

  // Add models to sequelize instance
  testSequelize.addModels([Department, User, Task, TaskHistory, Notification, Approval, Announcement, Report]);

  // Sync database
  await testSequelize.sync({ force: true });
});

afterAll(async () => {
  // Close database connection
  await testSequelize.close();
});

beforeEach(async () => {
  // Clear all tables before each test
  await testSequelize.truncate({ cascade: true, restartIdentity: true });
});

// Export app for tests
export { app };
export default app;

// Helper function to create authenticated request
export const createAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json'
});