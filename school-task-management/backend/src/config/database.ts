import { Sequelize } from 'sequelize-typescript';
import {
  Announcement,
  Approval,
  Department,
  Notification,
  Report,
  Task,
  TaskHistory,
  User
} from '../models';

const config = require('../../config/config.js');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

export const sequelize = new Sequelize({
  ...dbConfig,
  models: [Department, User, Task, TaskHistory, Notification, Approval, Announcement, Report],
  define: {
    freezeTableName: true
  },
  logging: false
});
