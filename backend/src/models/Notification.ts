import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table
} from 'sequelize-typescript';
import { Task } from './Task';
import { User } from './User';
import { NOTIFICATION_TYPES, NotificationType } from './enums';

@Table({
  tableName: 'notifications',
  timestamps: false
})
export class Notification extends Model<Notification> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare user_id: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...NOTIFICATION_TYPES))
  declare type: NotificationType;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare message: string;

  @ForeignKey(() => Task)
  @Column(DataType.INTEGER.UNSIGNED)
  declare task_id: number | null;

  @Default(false)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare is_read: boolean;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare created_at: Date;

  @BelongsTo(() => User, 'user_id')
  declare user?: User;

  @BelongsTo(() => Task, 'task_id')
  declare task?: Task;
}