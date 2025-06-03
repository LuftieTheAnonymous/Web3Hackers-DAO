import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

export const client = createClient({
    username: 'default',
    password: process.env.REDIS_DB_PASSWORD,
    socket: {
        host: 'redis-17405.c10.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 17405
    }
});
