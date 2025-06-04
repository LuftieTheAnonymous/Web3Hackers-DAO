import { QueueEvents } from "bullmq";
import { redisConnection } from "../set-up.js";

const queueEvents = new QueueEvents('smart-contracts-jobs', {connection:redisConnection});

queueEvents.on('progress', (job) => console.info(`Job ${job.jobId} in progress`));
queueEvents.on('completed', (job) => console.info(`Job ${job.jobId} completed`));
queueEvents.on('error', (err) => console.error('Worker error', err));
queueEvents.on('failed', (job, err) => console.error(`Job ${job.jobId} failed`, err));