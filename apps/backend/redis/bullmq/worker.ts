import { Worker } from "bullmq";
import { monthlyTokenDistribution } from "./jobs/token/monthlyTokenDistribution.js";
import { queueProposals } from "./jobs/governor/queueProposals.js";
import { executeProposals } from "./jobs/governor/executeProposals.js";
import { finishProposals } from "./jobs/governor/finishProposals.js";
import { redisConnection } from "../set-up.js";
import dotenv from "dotenv";
dotenv.config();

const worker = new Worker('smart-contracts-jobs', async (job) => {
    
    switch(job.name) {
        case 'monthly-distribution':
            await monthlyTokenDistribution();
        case 'queue-proposals':
            await queueProposals();
        case 'execute-proposals':
            await executeProposals();
        case 'finish-proposals':
            await finishProposals();
        }
},{connection:redisConnection, limiter:{
    'max':20,
    'duration':1000 * 60 * 60 
}});


worker.on('completed', (job) => console.info(`Job ${job.name} completed`));
worker.on('error', (err) => console.error('Worker error', err));
worker.on('failed', (job, err) => console.error(`Job ${job?.name} failed`, err));