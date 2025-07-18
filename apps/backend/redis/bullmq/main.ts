import {Queue} from 'bullmq';
import { redisConnection } from '../set-up.js';
import dotenv from "dotenv";
dotenv.config();




export const smartContractsInteracionQueue = new Queue("smart-contracts-jobs", {
    connection:redisConnection
});

await smartContractsInteracionQueue.setGlobalConcurrency(5);

await smartContractsInteracionQueue.upsertJobScheduler(
  'monthly-distribution-scheduler',
  {
    every: 1000 * 60 * 60 * 24, // codziennie
    startDate: Date.now(), // lub Date.now()
  },
  {
'name': 'monthly-distribution',
    data: {},
  }
);

await smartContractsInteracionQueue.add("activate-proposals", {},{ repeat: {'every': 1000 * 60 * 2 }, removeOnComplete: true, });
await smartContractsInteracionQueue.add("finish-proposals", {},{ repeat: {'every': 1000 * 60 * 2 }, 'delay':1000, removeOnComplete: true,  });
await smartContractsInteracionQueue.add("queue-proposals", {},{ repeat: {'every': 1000 * 60 * 2  }, 'delay': 2000 , removeOnComplete: true, });
await smartContractsInteracionQueue.add("execute-proposals", {},{ repeat: {'every': 1000 * 60 * 2  }, 'delay': 3000,removeOnComplete: true,  });



export const activityInteracionQueue = new Queue("activityJobs", {
    connection:redisConnection
});


await activityInteracionQueue.setGlobalConcurrency(5);

await activityInteracionQueue.add("activity-update", {},{ repeat: {'every': 1000 * 60  * 10 }, removeOnComplete: true,  });