import {
  AllowNull,
  AutoIncrement,
  Column,
  DataType,
  Default,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  Unique
} from 'sequelize-typescript';
import { Approval } from './Approval';
import { Notification } from './Notification';
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

  @Column(DataType.INTEGER.UNSIGNED)
  declare department_id: number | null;

  @Default(true)
  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @Column(DataType.DATE)
  declare last_login: Date | null;

  @HasMany(() => Notification, 'user_id')
  declare notifications?: Notification[];

  @HasMany(() => Approval, 'requested_by')
  declare requestedApprovals?: Approval[];

  @HasMany(() => Approval, 'approved_by')
  declare approvedApprovals?: Approval[];
}