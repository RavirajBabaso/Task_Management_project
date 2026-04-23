import http from 'http';
import cors from 'cors';
import express from 'express';
import { sequelize } from './src/config/database';
import { initSocket } from './src/config/sockets';
import routes from './src/routes';

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', routes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');

    initSocket(server);

    server.listen(3000, () => {
      console.log('API server running on port 3000');
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
export { server };