import {Queue} from 'bullmq';
import { redisConnection } from '../set-up.js';
import dotenv from "dotenv";
dotenv.config();




const smartContractsInteracionQueue = new Queue("smart-contracts-jobs", {
    connection:redisConnection
});

await smartContractsInteracionQueue.setGlobalConcurrency(5);

await smartContractsInteracionQueue.add("monthly-distribution", {},{ repeat: {'every': 1000 * 60 * 60 * 24 * 30 }, removeOnComplete: true  });
await smartContractsInteracionQueue.add("activate-proposals", {},{ repeat: {'every': 1000 * 60 * 15 }, removeOnComplete: true, });
await smartContractsInteracionQueue.add("queue-proposals", {},{ repeat: {'every': 1000 * 60 * 30  }, 'delay': 1000 , removeOnComplete: true, });
await smartContractsInteracionQueue.add("finish-proposals", {},{ repeat: {'every': 1000 * 60 * 30 }, 'delay': 2000, removeOnComplete: true,  });
await smartContractsInteracionQueue.add("execute-proposals", {},{ repeat: {'every': 1000 * 60 * 15  }, 'delay': 3000,removeOnComplete: true,  });


const activityInteracionQueue = new Queue("activity-jobs", {
    connection:redisConnection
});

await activityInteracionQueue.setGlobalConcurrency(5);

await activityInteracionQueue.add("update-activity", {},{ repeat: {'every': 1000 * 60 * 30 }, removeOnComplete: true,  });