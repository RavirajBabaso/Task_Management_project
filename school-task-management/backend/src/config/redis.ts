import Redis from 'ioredis';
import { env } from './env';

const redisClient = new Redis({
  host: env.redis.host,
  port: env.redis.port,
  lazyConnect: true,
  maxRetriesPerRequest: 3
});

redisClient.on('error', (error) => {
  console.error('Redis client error:', error.message);
});

export default redisClient;
