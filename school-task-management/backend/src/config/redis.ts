import Redis from 'ioredis';
import { env } from './env';

// Mock Redis methods
const mockRedis = {
  set: async (...args: any[]) => 'OK',
  get: async (...args: any[]) => null,
  del: async (...args: any[]) => 1,
  exists: async (...args: any[]) => 0
};

let redisClient: any = mockRedis;

try {
  const realRedis = new Redis({
    host: env.redis.host,
    port: env.redis.port,
    lazyConnect: true,
    maxRetriesPerRequest: 3
  });

  realRedis.on('connect', () => {
    console.log('Redis connected successfully');
    redisClient = realRedis;
  });

  realRedis.on('error', (error) => {
    console.error('Redis client error:', error.message);
    // Keep using mockRedis
  });

  // Try to connect after a short delay
  setTimeout(() => {
    realRedis.connect().catch(() => {
      console.log('Using mock Redis');
    });
  }, 1000);

} catch (error) {
  console.error('Failed to create Redis client:', error);
  // Keep using mockRedis
}

export default redisClient;
