import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Task } from './Task';
import { User } from './User';
import { TASK_STATUSES, TaskStatus } from './enums';

@Table({
  tableName: 'task_histories',
  timestamps: false
})
export class TaskHistory extends Model<TaskHistory> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @ForeignKey(() => Task)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare task_id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare updated_by: number;

  @Column(DataType.ENUM(...TASK_STATUSES))
  declare old_status: TaskStatus | null;

  @AllowNull(false)
  @Column(DataType.ENUM(...TASK_STATUSES))
  declare new_status: TaskStatus;

  @Column(DataType.TEXT)
  declare comment: string | null;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare updated_at: Date;

  @BelongsTo(() => Task, 'task_id')
  declare task?: Task;

  @BelongsTo(() => User, 'updated_by')
  declare updatedBy?: User;
}
