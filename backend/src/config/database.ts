import { Sequelize } from 'sequelize-typescript';
import { User, Notification, Approval, Task, TaskHistory, Department, Announcement, Report } from '../models';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME || 'cms_db',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  models: [User, Notification, Approval, Task, TaskHistory, Department, Announcement, Report],
  define: {
    freezeTableName: true
  },
  logging: false
});