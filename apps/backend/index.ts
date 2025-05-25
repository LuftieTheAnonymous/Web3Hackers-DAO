import { logger } from "./config/logger";
import {  executeGovenorTokenEvents } from "./event-listeners/GovTokenEventListener";
import { executeGovenorContractEvents } from "./event-listeners/GovenorEventListener";
import govTokenRouter from "./routes/GovTokenRouter";
import governanceRouter from "./routes/GovernanceRouter";
import membersRouter from "./routes/MembersRouter";
import activityRouter from "./routes/ActivityRouter";
import router from "./routes/NotificationsRouter";
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const app = express();
dotenv.config();

// let whitelist=['http://localhost:3000', 'http://localhost:2138', 'http://localhost:2137'];

// const corsOptions = {
//     origin: function (origin: any, callback: any) {
//         if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }
app.use(cors());
app.use(express.json());


// app.use(cors(corsOptions));
app.use('/governance',governanceRouter);
app.use('/gov_token', govTokenRouter);
app.use('/members', membersRouter);
app.use('/activity', activityRouter);
app.use('/notifications', router);
const server = http.createServer(app);


server.listen(2137, () => {

executeGovenorContractEvents();
executeGovenorTokenEvents();

 logger.info('Server is running on port 2137');
});
