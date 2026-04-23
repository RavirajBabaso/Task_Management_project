"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequelize = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const models_1 = require("../models");
exports.sequelize = new sequelize_typescript_1.Sequelize({
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'cms_db',
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    models: [models_1.User, models_1.Notification, models_1.Approval, models_1.Task, models_1.TaskHistory, models_1.Department, models_1.Announcement, models_1.Report],
    define: {
        freezeTableName: true
    },
    logging: false
});
