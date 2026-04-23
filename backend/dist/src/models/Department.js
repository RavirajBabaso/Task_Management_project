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
exports.Department = void 0;
const sequelize_typescript_1 = require("sequelize-typescript");
const Task_1 = require("./Task");
const User_1 = require("./User");
const Announcement_1 = require("./Announcement");
const Report_1 = require("./Report");
let Department = class Department extends sequelize_typescript_1.Model {
};
exports.Department = Department;
__decorate([
    sequelize_typescript_1.PrimaryKey,
    sequelize_typescript_1.AutoIncrement,
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Number)
], Department.prototype, "id", void 0);
__decorate([
    (0, sequelize_typescript_1.AllowNull)(false),
    sequelize_typescript_1.Unique,
    (0, sequelize_typescript_1.Column)({
        type: sequelize_typescript_1.DataType.STRING(150),
        validate: {
            notEmpty: true,
            len: [2, 150]
        }
    }),
    __metadata("design:type", String)
], Department.prototype, "name", void 0);
__decorate([
    (0, sequelize_typescript_1.ForeignKey)(() => User_1.User),
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.INTEGER.UNSIGNED),
    __metadata("design:type", Object)
], Department.prototype, "head_user_id", void 0);
__decorate([
    (0, sequelize_typescript_1.Column)(sequelize_typescript_1.DataType.TEXT),
    __metadata("design:type", Object)
], Department.prototype, "description", void 0);
__decorate([
    (0, sequelize_typescript_1.BelongsTo)(() => User_1.User, 'head_user_id'),
    __metadata("design:type", User_1.User)
], Department.prototype, "headUser", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => User_1.User, 'department_id'),
    __metadata("design:type", Array)
], Department.prototype, "users", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Task_1.Task, 'department_id'),
    __metadata("design:type", Array)
], Department.prototype, "tasks", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Announcement_1.Announcement, 'department_id'),
    __metadata("design:type", Array)
], Department.prototype, "announcements", void 0);
__decorate([
    (0, sequelize_typescript_1.HasMany)(() => Report_1.Report, 'department_id'),
    __metadata("design:type", Array)
], Department.prototype, "reports", void 0);
exports.Department = Department = __decorate([
    (0, sequelize_typescript_1.Table)({
        tableName: 'departments',
        timestamps: false
    })
], Department);
