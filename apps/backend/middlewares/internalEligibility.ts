import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
import { daoContract, proposalStates } from "../config/ethersConfig.js";
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

console.log('Middleware Passed');
next();
}

export async function proposalCancelEndpointEligibilityMiddleware(req:Request, res:Response, next:NextFunction) {
    const headers = req.headers['authorization'];
    const proposalId = req.params.proposalId;
    if(!headers) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to fire this endpoint.", status:403});
    }

    const userAddress = (headers as string).split(" ")[1];

    const proposal = await daoContract.getProposal(proposalId);

    if(proposal.proposer !== userAddress) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to fire this endpoint.", status:403});
    }

    if(proposal.state !== 0) {
        res.status(403).json({error:"Forbidden", message:`Sorry, the proposal is not cancellable anymore at this stage. It's been ${proposalStates[Number(proposal.state)]}.`, status:403});
    }

console.log('Cancel Middleware Passed');
next();

}
