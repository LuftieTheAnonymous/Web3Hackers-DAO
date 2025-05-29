import { logger } from "./config/logger";
import {  executeGovenorTokenEvents } from "./event-listeners/GovTokenEventListener";
import { executeGovenorContractEvents } from "./event-listeners/GovenorEventListener";
import govTokenRouter from "./routes/GovTokenRouter";
import governanceRouter from "./routes/GovernanceRouter";
import membersRouter from "./routes/MembersRouter";
import activityRouter from "./routes/ActivityRouter";
import router from "./routes/NotificationsRouter";
import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
const http = require('http');
const app = express();
import helmet from 'helmet';
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
   referrerPolicy: { policy: 'strict-origin-when-cross-origin' }, 
}));

app.use(express());

app.use(cors({
    allowedHeaders:['Content-Type', 'Authorization', 'x-backend-eligibility', 'is-frontend-req'],
    origin:['http://localhost:3000', 'https://localhost:2137', 'http://localhost:2138'],
    methods:['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    maxAge: 600, // 10 minutes
}));

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
