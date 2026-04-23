"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Department_1 = require("./Department");
const Notification_1 = require("./Notification");
const TaskHistory_1 = require("./TaskHistory");
const User_1 = require("./User");
const enums_1 = require("./enums");
let Task = class Task extends sequelize_typescript_1.Model {
};
exports.Task = Task;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Number)
], Task.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(255),
        validate: {
            notEmpty: true,
            len: [3, 255]
        }
    }),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", Object)
], Task.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Number)
], Task.prototype, "assigned_by", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Number)
], Task.prototype, "assigned_to", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Department_1.Department),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Object)
], Task.prototype, "department_id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...enums_1.TASK_PRIORITIES)),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...enums_1.TASK_STATUSES)),
    __metadata("design:type", String)
], Task.prototype, "status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Task.prototype, "start_date", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Date)
], Task.prototype, "due_date", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.STRING(500)),
    __metadata("design:type", Object)
], Task.prototype, "attachment_path", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.DATE),
    __metadata("design:type", Object)
], Task.prototype, "completed_at", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, 'assigned_by'),
    __metadata("design:type", User_1.User)
], Task.prototype, "assignedBy", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, 'assigned_to'),
    __metadata("design:type", User_1.User)
], Task.prototype, "assignedTo", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Department_1.Department, 'department_id'),
    __metadata("design:type", Department_1.Department)
], Task.prototype, "department", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => TaskHistory_1.TaskHistory, 'task_id'),
    __metadata("design:type", Array)
], Task.prototype, "history", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Notification_1.Notification, 'task_id'),
    __metadata("design:type", Array)
], Task.prototype, "notifications", void 0);
exports.Task = Task = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'tasks',
        timestamps: false
    })
], Task);
