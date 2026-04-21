import {
  AllowNull,
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript';
import { Announcement } from './Announcement';
import { Approval } from './Approval';
import { Department } from './Department';
import { Notification } from './Notification';
import { Report } from './Report';
import { Task } from './Task';
import { TaskHistory } from './TaskHistory';
import { USER_ROLES, UserRole } from './enums';

@Table({
  tableName: 'users',
  timestamps: false
})
export class User extends Model<User> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(150),
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  })
  declare name: string;

  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.STRING(191),
    validate: {
      isEmail: true,
      notEmpty: true
    }
  })
  declare email: string;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(255),
    validate: {
      notEmpty: true
    }
  })
  declare password_hash: string;

  @AllowNull(false)
  @Column(DataType.ENUM(...USER_ROLES))
  declare role: UserRole;

  @ForeignKey(() => Department)
  @Column(DataType.INTEGER.UNSIGNED)
  declare department_id: number | null;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @Column(DataType.DATE)
  declare last_login: Date | null;

  @BelongsTo(() => Department, 'department_id')
  declare department?: Department;

  @HasMany(() => Task, 'assigned_to')
  declare assignedTasks?: Task[];

  @HasMany(() => Task, 'assigned_by')
  declare createdTasks?: Task[];

  @HasMany(() => TaskHistory, 'updated_by')
  declare taskHistoryUpdates?: TaskHistory[];

  @HasMany(() => Notification, 'user_id')
  declare notifications?: Notification[];

  @HasMany(() => Approval, 'requested_by')
  declare requestedApprovals?: Approval[];

  @HasMany(() => Approval, 'approved_by')
  declare approvedApprovals?: Approval[];

  @HasMany(() => Announcement, 'created_by')
  declare announcements?: Announcement[];

  @HasMany(() => Report, 'generated_by')
  declare reports?: Report[];
}
