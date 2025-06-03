import { Worker } from 'bullmq';
import { client } from '../../quickStart';
import IORedis from 'ioredis';

const connection = new IORedis({maxRetriesPerRequest:null});


const activateProposalsWorker = new Worker('activateProposals', async (job) => {
    // Your job processing logic here
    console.log(`Processing job ${job.id} with data:`, job.data);

    console.log(`Job ${job.id} completed`);
},{
connection
})