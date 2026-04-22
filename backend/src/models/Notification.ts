import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Task } from './Task';

export class Notification extends Model {
  public id!: number;
  public user_id!: number;
  public type!: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_DELAYED' | 'TASK_ESCALATED' | 'ANNOUNCEMENT';
  public message!: string;
  public task_id!: number | null;
  public is_read!: boolean;
  public readonly created_at!: Date;
}

Notification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('TASK_ASSIGNED', 'TASK_UPDATED', 'TASK_DELAYED', 'TASK_ESCALATED', 'ANNOUNCEMENT'),
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    task_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      references: {
        model: Task,
        key: 'id',
      },
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: false,
    createdAt: 'created_at',
    updatedAt: false,
  }
);

Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Notification.belongsTo(Task, { foreignKey: 'task_id', as: 'task' });