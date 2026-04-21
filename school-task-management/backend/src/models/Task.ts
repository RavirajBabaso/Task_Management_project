import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Department } from './Department';
import { Notification } from './Notification';
import { TaskHistory } from './TaskHistory';
import { User } from './User';
import { TASK_PRIORITIES, TASK_STATUSES, TaskPriority, TaskStatus } from './enums';

@Table({
  tableName: 'tasks',
  timestamps: false
})
export class Task extends Model<Task> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    validate: {
      notEmpty: true,
      len: [3, 255]
    }
  })
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare assigned_by: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare assigned_to: number;

  @ForeignKey(() => Department)
  @Column(DataType.INTEGER.UNSIGNED)
  declare department_id: number | null;

  @AllowNull(false)
  @Column(DataType.ENUM(...TASK_PRIORITIES))
  declare priority: TaskPriority;

  @AllowNull(false)
  @Column(DataType.ENUM(...TASK_STATUSES))
  declare status: TaskStatus;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare start_date: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare due_date: Date;

  @Column(DataType.STRING(500))
  declare attachment_path: string | null;

  @Column(DataType.DATE)
  declare completed_at: Date | null;

  @BelongsTo(() => User, 'assigned_by')
  declare assignedBy?: User;

  @BelongsTo(() => User, 'assigned_to')
  declare assignedTo?: User;

  @BelongsTo(() => Department, 'department_id')
  declare department?: Department;

  @HasMany(() => TaskHistory, 'task_id')
  declare history?: TaskHistory[];

  @HasMany(() => Notification, 'task_id')
  declare notifications?: Notification[];
}
