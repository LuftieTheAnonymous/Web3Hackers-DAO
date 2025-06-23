import { Worker } from "bullmq";
import { monthlyTokenDistribution } from "./jobs/token/monthlyTokenDistribution.js";
import { queueProposals } from "./jobs/governor/queueProposals.js";
import { executeProposals } from "./jobs/governor/executeProposals.js";
import { finishProposals } from "./jobs/governor/finishProposals.js";
import { redisConnection } from "../set-up.js";
import dotenv from "dotenv";
import { activateProposals } from "./jobs/governor/activateProposals.js";
import { updateMembersActivity } from "./jobs/activity/updateActivity.js";
dotenv.config();

const worker = new Worker('smart-contracts-jobs', async (job) => {
    
    switch(job.name) {
        case 'monthly-distribution':
            await monthlyTokenDistribution();
        case 'activate-proposals':
            await activateProposals();
        case 'queue-proposals':
            await queueProposals();
        case 'execute-proposals':
            await executeProposals();
        case 'finish-proposals':
            await finishProposals();
        }
},{connection:redisConnection, limiter:{
    'max':20,
    'duration':1000 * 60 * 2
}});

worker.on('completed', (job) => console.info(`Job ${job.name} completed`));
worker.on('error', (err) => console.error('Worker error', err));
worker.on('failed', (job, err) => console.error(`Job ${job?.name} failed`, err));

const updateActivityWorker = new Worker('activityJobs', async (job) => {
    switch(job.name) {
        case 'activity-update':
            await updateMembersActivity();
        }
},{connection:redisConnection, limiter:{
    'max':15,
    'duration': 1000 * 60 * 5
}});

updateActivityWorker.on('completed', (job) => console.info(`Activity Job ${job.name} completed`));
updateActivityWorker.on('error', (err) => console.error('Activity Worker error', err));
updateActivityWorker.on('failed', (job, err) => console.error(`Activity Job ${job?.name} failed`, err));
