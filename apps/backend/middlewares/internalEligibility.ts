import { NextFunction, Request, Response } from "express";
import dotenv from 'dotenv';
import { standardGovernorContract, customGovernorContract, proposalStates } from "../config/ethersConfig.js";
import redisClient from "../redis/set-up.js";
import { supabaseConfig } from "../config/supabase.js";
import logger from "../config/winstonConfig.js";
dotenv.config();

export function DAO_Discord_elligibilityMiddleware(req:Request, res:Response, next:NextFunction) {
    if(!req.headers['x-backend-eligibility'] ||  req.headers['x-backend-eligibility'] !== process.env.DISCORD_BOT_INTERNAL_SECRET) {
        console.log('error');
        res.status(403).json({error:"Forbidden", message:"You are not allowed to access this resource.", status:403});
    }

    logger.warn('Internal Eligibility Middleware Passed');

next();
}

export function frontend_Discord_elligibilityMiddleware(req:Request, res:Response, next:NextFunction) {
    if(!req.headers['x-backend-eligibility'] && (req.headers['x-backend-eligibility'] !== process.env.FRONTEND_ACCESS_SECRET || req.headers['x-backend-eligibility'] !== process.env.DISCORD_BOT_INTERNAL_SECRET)) {
        console.log('error');
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

export async function Membership_ProposalCancel_Middleware(req:Request, res:Response, next:NextFunction) {
    const headers = req.headers['authorization'];
    const proposalId = req.params.proposalId;
    const isCustomGovernor = req.query.customGovernor;

    const daoContract = isCustomGovernor === 'true' ? customGovernorContract : standardGovernorContract;

    if(!headers) {
        res.status(403).json({error:"Forbidden", message:"You are not allowed to fire this endpoint.", status:403});
        return;
    }

    const userDiscordId = (headers as string).split(" ")[1];

    const redisStoredMember = await redisClient.hGet(`dao_members`, userDiscordId);

    console.log('redis stored member:', redisStoredMember);

    const proposal = await daoContract.getProposal(proposalId);

    if(!redisStoredMember) {
        const {data}=await supabaseConfig.from('dao_members').select('*').eq('discord_member_id', Number(userDiscordId)).single();

        if(!data) {
            res.status(403).json({error:"Forbidden", message:"There is no user with this discord id given.", status:403});
            return;
        }

        const redisObject={
            userWalletAddress: data.userWalletAddress,
            discordId: `${userDiscordId}`,
            nickname: data.nickname,
            isAdmin: `${data.isAdmin}`,
            photoURL: data.photoURL
        };

        await redisClient.hSet(`dao_members`, userDiscordId, JSON.stringify(redisObject));

        if(proposal.proposer !== data.userWalletAddress) {
            res.status(403).json({error:"Forbidden", message:"You are not allowed to fire this endpoint.", status:403});
            return;
        }
    } else {
        const memberData = JSON.parse(redisStoredMember);
        if(proposal.proposer !== memberData.userWalletAddress) {
            res.status(403).json({error:"Forbidden", message:"You are not allowed to fire this endpoint.", status:403});
            return;
        }
    }

    if(proposal.state !== 0) {
        res.status(403).json({error:"Forbidden", message:`Sorry, the proposal is not cancellable anymore at this stage. It's been ${proposalStates[Number(proposal.state)]}.`, status:403});
   return;
    }

console.log('Cancel Middleware Passed');
next();

}

export async function MembershipMiddleware(req:Request, res:Response, next:NextFunction){
    try{
          const memberId = req.params.memberDiscordId;

           const redisStoredMember = await redisClient.hGet(`dao_members`, memberId);

    console.log('redis stored member:', redisStoredMember);

    if(!redisStoredMember) {
        const {data, error}=await supabaseConfig.from('dao_members').select('*').eq('discord_member_id', Number(memberId)).single();

        if(!data) {
            res.status(403).json({error:"Forbidden", message:"There is no user with this discord id given.", status:403});
            return;
        }

        if(error){
            res.status(403).json({error:"Forbidden", message:"There is no user with this discord id given.", status:403});
            return;
        }

        const redisObject={
            userWalletAddress: data.userWalletAddress,
            discordId: `${memberId}`,
            nickname: data.nickname,
            isAdmin: `${data.isAdmin}`,
            photoURL: data.photoURL
        };

        await redisClient.hSet(`dao_members`, memberId, JSON.stringify(redisObject));

        next();
        return;
    }

    next();


    }catch(err){
        console.log(err);
    }
}