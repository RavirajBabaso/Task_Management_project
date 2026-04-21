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
import { env } from './env';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  username: env.db.user,
  password: env.db.password,
  models: [Department, User, Task, TaskHistory, Notification, Approval, Announcement, Report],
  define: {
    freezeTableName: true
  },
  logging: false
});
