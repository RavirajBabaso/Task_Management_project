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
import { REPORT_TYPES, ReportType } from './enums';

@Table({
  tableName: 'reports',
  timestamps: false
})
export class Report extends Model<Report> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @AllowNull(false)
  @Column(DataType.ENUM(...REPORT_TYPES))
  declare type: ReportType;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.INTEGER.UNSIGNED)
  declare generated_by: number;

  @AllowNull(false)
  @Column({
    type: DataType.STRING(500),
    validate: {
      notEmpty: true
    }
  })
  declare file_path: string;

  @ForeignKey(() => Department)
  @Column(DataType.INTEGER.UNSIGNED)
  declare department_id: number | null;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare date_from: Date;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare date_to: Date;

  @AllowNull(false)
  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW
  })
  declare created_at: Date;

  @BelongsTo(() => User, 'generated_by')
  declare generatedBy?: User;

  @BelongsTo(() => Department, 'department_id')
  declare department?: Department;
}