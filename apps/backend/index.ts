
import {  executeGovenorTokenEvents } from "./event-listeners/TokenManagerEventListeners.js";
import { executeGovenorContractEvents } from "./event-listeners/GovenorEventListener.js";
import govTokenRouter from "./routes/GovTokenRouter.js";
import governanceRouter from "./routes/GovernanceRouter.js";
import membersRouter from "./routes/MembersRouter.js";
import activityRouter from "./routes/ActivityRouter.js";
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import http from "http";
import helmet from 'helmet';
import redisClient  from "./redis/set-up.js";
import logger from "./config/winstonConfig.js";
import './redis/bullmq/main.js';
import './redis/bullmq/worker.js';
import './redis/bullmq/queueEvents.js';
import { supabaseConfig } from "./config/supabase.js";
const app = express();
dotenv.config();

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
    origin:[process.env.FRONTEND_ENDPOINT_1 as string, process.env.BACKEND_ENDPOINT_1 as string],
    methods:['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    maxAge: 600, // 10 minutes
}));



app.use(express.json());
app.use('/governance', governanceRouter);
app.use('/gov_token', govTokenRouter);
app.use('/members', membersRouter);
app.use('/activity', activityRouter);


const server = http.createServer(app);

if (!redisClient.isOpen) await redisClient.connect();
await redisClient.auth({password:process.env.REDIS_DB_PASSWORD as string});

redisClient.on('error', (err:any) => logger.info('Redis Client Error', err));
redisClient.on('connect', () => logger.info('Redis Client Connected'));
redisClient.on('disconnect', async () => await redisClient.connect());

export const runningPort = 2137;

server.listen(2137, async () => {
    logger.info(`Server started on port ${runningPort}`, {
        timestamp: new Date().toISOString(),
        port: runningPort,
    });

    
executeGovenorContractEvents();
executeGovenorTokenEvents();

});
