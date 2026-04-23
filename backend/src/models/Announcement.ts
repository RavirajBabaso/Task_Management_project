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
import { Department } from './Department';
import { User } from './User';
import { ANNOUNCEMENT_TARGETS, AnnouncementTarget } from './enums';

@Table({
  tableName: 'announcements',
  timestamps: false
})
export class Announcement extends Model<Announcement> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare created_by: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...ANNOUNCEMENT_TARGETS))
  declare target: AnnouncementTarget;

  @AllowNull(false)
  @Column({
    type: DataType.TEXT,
    validate: {
      notEmpty: true
    }
  })
  declare message: string;

  @ForeignKey(() => Department)
  @Column(DataType.INTEGER.UNSIGNED)
  declare department_id: number | null;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare created_at: Date;

  @BelongsTo(() => User, 'created_by')
  declare creator?: User;

  @BelongsTo(() => Department, 'department_id')
  declare department?: Department;
}