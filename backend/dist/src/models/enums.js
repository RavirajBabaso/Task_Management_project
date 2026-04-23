"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPORT_TYPES = exports.ANNOUNCEMENT_TARGETS = exports.APPROVAL_STATUSES = exports.APPROVAL_TYPES = exports.NOTIFICATION_TYPES = exports.TASK_STATUSES = exports.TASK_PRIORITIES = exports.USER_ROLES = void 0;
exports.USER_ROLES = [
    'CHAIRMAN',
    'DIRECTOR',
    'PROPERTY',
    'FINANCE',
    'ADMIN',
    'PRINCIPAL',
    'ADMISSION',
    'HR',
    'PURCHASE',
    'IT',
    'TRANSPORT'
];
exports.TASK_PRIORITIES = ['HIGH', 'MEDIUM', 'LOW'];
exports.TASK_STATUSES = ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DELAYED', 'ESCALATED'];
exports.NOTIFICATION_TYPES = [
    'TASK_ASSIGNED',
    'TASK_UPDATED',
    'TASK_DELAYED',
    'TASK_ESCALATED',
    'ANNOUNCEMENT'
];
exports.APPROVAL_TYPES = ['BUDGET', 'PURCHASE', 'POLICY', 'EVENT'];
exports.APPROVAL_STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];
exports.ANNOUNCEMENT_TARGETS = ['ALL', 'DEPARTMENT'];
exports.REPORT_TYPES = ['DAILY', 'WEEKLY', 'MONTHLY'];
