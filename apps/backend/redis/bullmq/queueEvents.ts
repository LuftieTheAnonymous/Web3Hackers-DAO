import { QueueEvents } from "bullmq";
import { redisConnection } from "../set-up.js";

const updateQueueEvents = new QueueEvents('Smart_contracts-jobs', {connection:redisConnection});


updateQueueEvents.on('progress', (job) => console.info(`Job ${job.jobId} in progress`));
updateQueueEvents.on('completed', (job) => console.info(`Job ${job.jobId} completed`));
updateQueueEvents.on('error', (err) => console.error('Worker error', err));
updateQueueEvents.on('failed', (job, err) => console.error(`Job ${job.jobId} failed`, err));

updateQueueEvents.on('cleaned', (job) => console.info(`Job ${job.count} cleaned`));

updateQueueEvents.on('drained', () => console.info('Drained'));

updateQueueEvents.on('ioredis:close', () => console.info('Connection closed'));

updateQueueEvents.on('removed', (job) => console.info(`Job ${job.jobId} removed`));


const updateActivityQueueEvents = new QueueEvents('activity_Jobs', {connection:redisConnection});

updateActivityQueueEvents.on('progress', (job) => console.info(`Job ${job.jobId} in progress`));
updateActivityQueueEvents.on('completed', (job) => console.info(`Job ${job.jobId} completed`));
updateActivityQueueEvents.on('error', (err) => console.error('Worker error', err));
updateActivityQueueEvents.on('failed', (job, err) => console.error(`Job ${job.jobId} failed`, err));

updateActivityQueueEvents.on('cleaned', (job) => console.info(`Job ${job.count} cleaned`));

updateActivityQueueEvents.on('drained', () => console.info('Drained'));

updateActivityQueueEvents.on('ioredis:close', () => console.info('Connection closed'));

updateActivityQueueEvents.on('removed', (job) => console.info(`Job ${job.jobId} removed`));