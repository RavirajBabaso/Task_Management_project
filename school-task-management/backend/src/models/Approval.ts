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
import { User } from './User';
import { APPROVAL_STATUSES, APPROVAL_TYPES, ApprovalStatus, ApprovalType } from './enums';

@Table({
  tableName: 'approvals',
  timestamps: false
})
export class Approval extends Model<Approval> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...APPROVAL_TYPES))
  declare type: ApprovalType;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare requested_by: number;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  declare approved_by: number | null;

  @AllowNull(false)
  @Column(DataType.ENUM(...APPROVAL_STATUSES))
  declare status: ApprovalStatus;

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
  declare details: string | null;

  @Column(DataType.DECIMAL(12, 2))
  declare amount: string | null;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare created_at: Date;

  @BelongsTo(() => User, 'requested_by')
  declare requestedBy?: User;

  @BelongsTo(() => User, 'approved_by')
  declare approvedBy?: User;
}
