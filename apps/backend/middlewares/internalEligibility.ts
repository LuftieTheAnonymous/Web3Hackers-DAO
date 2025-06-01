import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();

export function DAO_Discord_elligibilityMiddleware(req:Request, res:Response, next:NextFunction) {
    console.log(req.headers['x-backend-eligibility']);
    if(req.headers['x-backend-eligibility'] !== process.env.DISCORD_BOT_INTERNAL_SECRET) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to access this resource.", status:403});
    }

next();
}

export function DAO_CronJobs_elligibilityMiddleware(req:Request, res:Response, next:NextFunction) {
    console.log(req.headers['x-backend-eligibility']);
    if(req.headers['x-backend-eligibility'] !== process.env.CRONJOBS_INTERNAL_SECRET) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to access this resource. Because of not being a cron job", status:403});
        return;
    }

    next();
}

