import http from 'http';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import './config/redis';
import { sequelize } from './config/database';
import { env } from './config/env';
import { initSocket } from './config/socket';
import { errorHandler } from './middleware/error.middleware';
import routes from './routes';

const app = express();
const server = http.createServer(app);

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? env.frontendUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
  })
);

app.use('/api', routes);

app.use((_req: Request, _res: Response, next: NextFunction) => {
  const error = new Error('Route not found') as Error & { statusCode?: number };
  error.statusCode = 404;
  next(error);
});

app.use(errorHandler);

initSocket(server);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    server.listen(env.port, () => {
      console.log(`API server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start API server:', error);
    process.exit(1);
  }
};

if (require.main === module) {
  void startServer();
}

export default app;
export { server, startServer };
