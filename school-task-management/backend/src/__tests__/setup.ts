import { jest } from '@jest/globals';

// Mock ioredis
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    expire: jest.fn()
  }));
});

// Mock env config
jest.mock('../config/env', () => ({
  env: {
    db: {
      host: 'localhost',
      port: 3306,
      database: 'test',
      username: 'test',
      password: 'test'
    }
  }
}));

// Mock database config
jest.mock('../config/database', () => ({
  sequelize: {
    transaction: jest.fn().mockImplementation(async (fn: any) => {
      const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
      return fn(mockTransaction);
    })
  }
}));

// Mock sequelize models
jest.mock('../models', () => ({
  User: {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  Task: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    destroy: jest.fn()
  },
  TaskHistory: {
    create: jest.fn(),
    findAll: jest.fn()
  },
  Report: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  Notification: {
    create: jest.fn()
  },
  Department: {
    findAll: jest.fn(),
    findByPk: jest.fn()
  },
  Announcement: {
    findAll: jest.fn(),
    create: jest.fn()
  }
}));

// Mock external dependencies
jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
  verify: jest.fn()
}));

jest.mock('../utils/jwtUtils', () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn()
}));

jest.mock('../config/redis', () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
}));

jest.mock('../utils/pdfGenerator', () => ({
  generateTaskReport: jest.fn()
}));

jest.mock('../utils/excelGenerator', () => ({
  generateTaskExcel: jest.fn()
}));

jest.mock('../config/socket', () => ({
  emitToUser: jest.fn()
}));

jest.mock('../services/emailService', () => ({
  sendTaskAssignedEmail: jest.fn(),
  sendEscalationEmail: jest.fn()
}));