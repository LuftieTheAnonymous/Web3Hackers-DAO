import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
dotenv.config();

export function DAO_elligibilityMiddleware(req:Request, res:Response, next:NextFunction) {
    if(req.headers['x-backend-eligibility'] !== process.env.DISCORD_BOT_INTERNAL_SECRET || req.headers['x-backend-eligibility'] !== process.env.CRONJOBS_INTERNAL_SECRET) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to access this resource", status:403});
    }

next();
}

export function DAO_eligibilityCronJobMiddleware(req:Request, res:Response, next:NextFunction) {}