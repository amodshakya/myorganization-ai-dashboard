import { Sequelize } from 'sequelize';
import logger from '../logger';

const {
  DB_HOST = 'localhost',
  DB_PORT = '5432',
  DB_NAME = 'renewable_energy',
  DB_USER = 'postgres',
  DB_PASSWORD = 'postgres',
} = process.env;

export const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: parseInt(DB_PORT, 10),
  dialect: 'postgres',
  logging: (msg: string) => logger.debug(msg),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    underscored: true,
    timestamps: true,
  },
});

export { Sequelize };

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully.');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
}
