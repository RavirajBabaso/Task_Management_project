import { Sequelize } from 'sequelize-typescript';
import { env } from './env';

export const sequelize = new Sequelize({
  dialect: 'mysql',
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  username: env.db.user,
  password: env.db.password,
  models: [__dirname + '/../models'],
  logging: false
});
