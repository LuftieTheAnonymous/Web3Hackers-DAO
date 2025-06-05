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

export function rewardPunishEndpointEligibilityMiddleware(req:Request, res:Response, next:NextFunction) {
    const headers = req.headers['authorization'];

    if(!headers) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to access this resource.", status:403});
    }

    const token = (headers as string).split(" ")[1];

    if(token !== process.env.ADMIN_FUNCTION_ACCESS) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to access this resource.", status:403});
    }

next();
}

