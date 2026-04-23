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
  Table,
  Unique
} from 'sequelize-typescript';
import { Task } from './Task';
import { User } from './User';
import { Announcement } from './Announcement';
import { Report } from './Report';

@Table({
  tableName: 'departments',
  timestamps: false
})
export class Department extends Model<Department> {
  @PrimaryKey
  @AutoIncrement
  @Column(DataType.INTEGER.UNSIGNED)
  declare id: number;

  @AllowNull(false)
  @Unique
  @Column({
    type: DataType.STRING(150),
    validate: {
      notEmpty: true,
      len: [2, 150]
    }
  })
  declare name: string;

  @ForeignKey(() => User)
  @Column(DataType.INTEGER.UNSIGNED)
  declare head_user_id: number | null;

  @Column(DataType.TEXT)
  declare description: string | null;

  @BelongsTo(() => User, 'head_user_id')
  declare headUser?: User;

  @HasMany(() => User, 'department_id')
  declare users?: User[];

  @HasMany(() => Task, 'department_id')
  declare tasks?: Task[];

  @HasMany(() => Announcement, 'department_id')
  declare announcements?: Announcement[];

  @HasMany(() => Report, 'department_id')
  declare reports?: Report[];
}