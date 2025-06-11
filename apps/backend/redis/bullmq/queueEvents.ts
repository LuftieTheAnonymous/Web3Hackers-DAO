import { QueueEvents } from "bullmq";
import { redisConnection } from "../set-up.js";

const updateQueueEvents = new QueueEvents('smart-contract-jobs', {connection:redisConnection});

updateQueueEvents.on('progress', (job) => console.info(`Job ${job.jobId} in progress`));
updateQueueEvents.on('completed', (job) => console.info(`Job ${job.jobId} completed`));
updateQueueEvents.on('error', (err) => console.error('Worker error', err));
updateQueueEvents.on('failed', (job, err) => console.error(`Job ${job.jobId} failed`, err));

updateQueueEvents.on('cleaned', (job) => console.info(`Job ${job.count} cleaned`));

updateQueueEvents.on('drained', () => console.info('Drained'));

updateQueueEvents.on('ioredis:close', () => console.info('Connection closed'));

updateQueueEvents.on('removed', (job) => console.info(`Job ${job.jobId} removed`));