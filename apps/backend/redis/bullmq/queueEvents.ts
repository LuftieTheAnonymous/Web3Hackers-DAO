import { QueueEvents } from "bullmq";
import { redisConnection } from "../set-up.js";

const updateQueueEvents = new QueueEvents('smart-contracts-jobs', {connection:redisConnection});

updateQueueEvents.on('progress', (job) => console.info(`Job ${job.jobId} in progress`));
updateQueueEvents.on('completed', (job) => console.info(`Job ${job.jobId} completed`));
updateQueueEvents.on('error', (err) => console.error('Worker error', err));
updateQueueEvents.on('failed', (job, err) => console.error(`Job ${job.jobId} failed`, err));

