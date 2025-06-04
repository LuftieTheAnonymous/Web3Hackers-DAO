import {Queue} from 'bullmq';
import { redisConnection } from '../set-up.js';
import dotenv from "dotenv";
dotenv.config();




const queue = new Queue("smart-contracts-jobs", {
    connection:redisConnection
});

await queue.setGlobalConcurrency(5);

await queue.add("monthly-distribution", {},{ repeat: {'every': 1000 * 60 * 60 * 24 * 30 }, removeOnComplete: true  });
await queue.add("activate-proposals", {},{ repeat: {'every': 1000 * 60 * 15 }, removeOnComplete: true, });
await queue.add("queue-proposals", {},{ repeat: {'every': 1000 * 60 * 30  }, 'delay': 1000 , removeOnComplete: true, });
await queue.add("finish-proposals", {},{ repeat: {'every': 1000 * 60 * 30 }, 'delay': 2000, removeOnComplete: true,  });
await queue.add("execute-proposals", {},{ repeat: {'every': 1000 * 60 * 15  }, 'delay': 3000,removeOnComplete: true,  });