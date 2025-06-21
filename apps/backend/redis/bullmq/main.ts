import {Queue} from 'bullmq';
import { redisConnection } from '../set-up.js';
import dotenv from "dotenv";
dotenv.config();




export const smartContractsInteracionQueue = new Queue("smart-contracts-jobs", {
    connection:redisConnection
});

await smartContractsInteracionQueue.remove("monthly-distribution");
await smartContractsInteracionQueue.remove("activate-proposals");
await smartContractsInteracionQueue.remove("finish-proposals");
await smartContractsInteracionQueue.remove("queue-proposals");
await smartContractsInteracionQueue.remove("execute-proposals");

await smartContractsInteracionQueue.setGlobalConcurrency(5);

await smartContractsInteracionQueue.add("monthly-distribution", {},{ repeat: {'every': 1000 * 60 * 60 * 24 * 30 }, removeOnComplete: true,  });
await smartContractsInteracionQueue.add("activate-proposals", {},{ repeat: {'every': 1000 * 60 * 2 }, removeOnComplete: true, });
await smartContractsInteracionQueue.add("finish-proposals", {},{ repeat: {'every': 1000 * 60 * 2 }, 'delay':1000, removeOnComplete: true,  });
await smartContractsInteracionQueue.add("queue-proposals", {},{ repeat: {'every': 1000 * 60 * 2  }, 'delay': 2000 , removeOnComplete: true, });
await smartContractsInteracionQueue.add("execute-proposals", {},{ repeat: {'every': 1000 * 60 * 2  }, 'delay': 3000,removeOnComplete: true,  });



export const activityInteracionQueue = new Queue("activity-jobs", {
    connection:redisConnection
});

await activityInteracionQueue.setGlobalConcurrency(5);

await activityInteracionQueue.add("activity-update", {},{ repeat: {'every': 1000 * 60 * 30 }, removeOnComplete: true,  });