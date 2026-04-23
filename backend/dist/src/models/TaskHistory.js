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
exports.TaskHistory = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Task_1 = require("./Task");
const User_1 = require("./User");
const enums_1 = require("./enums");
let TaskHistory = class TaskHistory extends sequelize_typescript_1.Model {
};
exports.TaskHistory = TaskHistory;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Number)
], TaskHistory.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => Task_1.Task),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Number)
], TaskHistory.prototype, "task_id", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Number)
], TaskHistory.prototype, "updated_by", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...enums_1.TASK_STATUSES)),
    __metadata("design:type", Object)
], TaskHistory.prototype, "old_status", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.ENUM(...enums_1.TASK_STATUSES)),
    __metadata("design:type", String)
], TaskHistory.prototype, "new_status", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", Object)
], TaskHistory.prototype, "comment", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.DATE,
        defaultValue: sequelize_typescript_1.DataType.NOW
    }),
    __metadata("design:type", Date)
], TaskHistory.prototype, "updated_at", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => Task_1.Task, 'task_id'),
    __metadata("design:type", Task_1.Task)
], TaskHistory.prototype, "task", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, 'updated_by'),
    __metadata("design:type", User_1.User)
], TaskHistory.prototype, "updatedBy", void 0);
exports.TaskHistory = TaskHistory = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'task_histories',
        timestamps: false
    })
], TaskHistory);
