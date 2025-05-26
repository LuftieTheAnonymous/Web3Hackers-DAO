import { logger } from "./config/logger";
import {  executeGovenorTokenEvents } from "./event-listeners/GovTokenEventListener";
import { executeGovenorContractEvents } from "./event-listeners/GovenorEventListener";
import govTokenRouter from "./routes/GovTokenRouter";
import governanceRouter from "./routes/GovernanceRouter";
import membersRouter from "./routes/MembersRouter";
import activityRouter from "./routes/ActivityRouter";
import router from "./routes/NotificationsRouter";
import { NextFunction, Request, Response } from "express";
const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const app = express();
dotenv.config();


app.use(express());
app.use(cors({}));
app.use(express.json());


// app.use(cors(corsOptions));
app.use('/governance',(req:Request, res:Response, next:NextFunction)=>{
    if(req.originalUrl === '/governance/') {
        console.log(`${req.originalUrl}, ${req.method} ${new Date().toISOString()}`);
    }
    next();
}, governanceRouter);
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
