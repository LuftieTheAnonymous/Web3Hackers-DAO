import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redisConnection = {
  host: process.env.REDIS_DB_HOST as string,
  port: Number(process.env.REDIS_DB_PORT) || 17405,
  password: process.env.REDIS_DB_PASSWORD,
  username: 'default' // if needed
};

const redisClient = createClient({
  socket: {
    host: redisConnection.host,
    port: redisConnection.port,
  },
  username: redisConnection.username,
  password: redisConnection.password,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

await redisClient.connect();

export default redisClient;