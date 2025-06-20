
import {  executeGovenorTokenEvents } from "./event-listeners/GovTokenEventListener.ts";
import { executeGovenorContractEvents } from "./event-listeners/GovenorEventListener.ts";
import govTokenRouter from "./routes/GovTokenRouter.ts";
import governanceRouter from "./routes/GovernanceRouter.ts";
import membersRouter from "./routes/MembersRouter.ts";
import activityRouter from "./routes/ActivityRouter.ts";
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import http, { IncomingMessage } from "http";
import helmet from 'helmet';
import redisClient  from "./redis/set-up.ts";
import { createHandler } from 'graphql-http/lib/use/http';
import logger from "./config/winstonConfig.ts";
import './redis/bullmq/main.ts';
import './redis/bullmq/worker.ts';
import './redis/bullmq/queueEvents.ts';
import { schema } from './types/graphql/RootQuery.js';
const app = express();
dotenv.config();

// Create the GraphQL over HTTP Node request handler



// contentSecurityPolicy - strict set of rules that only allows resources from the same origin
// CROSS-ORIGIN OPENER POLICY - mitigates data leaks through shared browsing contexts
// CORP - Cross-Origin Resource Policy, which allows you to control how your resources are shared across origins
// Origin Agent Cluster - allows you to isolate your browsing context from other contexts, which can help prevent data leaks and improve security
// Referrer Policy -  Leaking URLs between sites (protects user privacy)
// Strict Transport Security - Enforces secure (HTTPS) connections to the server
// X-Content-Type-Options - Prevents MIME type sniffing
// X-DNS-Prefetch-Control - Disables DNS prefetching, privacy gain.
// X-Frame-Options - Prevents clickjacking attacks by controlling whether a page can be displayed in a frame or iframe
// X-XSS-Protection - Prevents reflected cross-site scripting (XSS) attacks

app.use(helmet({
    crossOriginResourcePolicy:{'policy':'cross-origin'},
    // strictTransportSecurity:{
    //     maxAge: 60 * 60 * 24 * 365, // 1 year in seconds
    //     includeSubDomains: true,
    //     preload: true
    // },
    dnsPrefetchControl:{ allow: true },
    xDownloadOptions: false,
    frameguard:{action:'sameorigin'},
xXssProtection:true,
    contentSecurityPolicy:{
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", 'cdn.discordapp.com'], // Adjust as needed
        },
    },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
   referrerPolicy: { policy: 'no-referrer' }, 
}));

app.use(cors({
    allowedHeaders:['Content-Type', 'Authorization', 'x-backend-eligibility', 'is-frontend-req', 'authorization'],
    origin:['http://localhost:3000', 'http://localhost:2138', 'https://localhost:3000'],
    methods:['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    maxAge: 600, // 10 minutes
}));



app.use(express.json());
app.use('/graphql', createHandler({ schema }));
app.use('/governance', governanceRouter);
app.use('/gov_token', govTokenRouter);
app.use('/members', membersRouter);
app.use('/activity', activityRouter);



const server = http.createServer(app);

redisClient.on('error', (err:any) => console.log('Redis Client Error', err));

if (!redisClient.isOpen) await redisClient.connect();


await redisClient.auth({password:process.env.REDIS_DB_PASSWORD as string});


export const runningPort=process.env.NODE_ENV !=='production' ? process.env.DEV_RUNNING_PORT : process.env.PRODUCTION_RUNNING_PORT;

server.listen(runningPort, async () => {
    logger.info(`Server started on port ${runningPort}`, {
        timestamp: new Date().toISOString(),
        port: runningPort,
    });

    
executeGovenorContractEvents();
executeGovenorTokenEvents();

});
