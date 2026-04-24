import http from 'http';
import path from 'path';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import './config/redis';
import { sequelize } from './config/database';
import { env } from './config/env';
import { initSocket } from './config/socket';
import { errorHandler } from './middleware/error.middleware';
import routes from './routes';
import delayAlertJob from './jobs/delayAlertJob';
import dailyReportJob from './jobs/dailyReportJob';
import weeklyReportJob from './jobs/weeklyReportJob';

const app = express();
const server = http.createServer(app);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
app.use(morgan('combined'));
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? env.frontendUrl,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  '/api/files/reports',
  express.static(path.resolve(process.cwd(), 'uploads', 'reports'))
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100
  })
);

app.use('/api', routes);

// Serve static files from the React build
app.use(express.static(path.join(__dirname, '../public')));

// Catch-all route for client-side routing
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

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

    // Start cron jobs
    delayAlertJob.start();
    dailyReportJob.start();
    weeklyReportJob.start();

    console.log('Cron jobs started');

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
