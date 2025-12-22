import { Request, Response } from "express";
import dotenv from "dotenv";
import { customGovernorContract, standardGovernorContract, proposalStates } from "../config/ethersConfig.js";

import { Contract, EventLog } from "ethers";
import { supabaseConfig } from "../config/supabase.js";
import redisClient from "../redis/set-up.js";
import logger from "../config/winstonConfig.js";
;

export interface ProposalEventArgs extends Omit<EventLog, 'args'> {
    args: string[]
}

dotenv.config();



const getProposalVotes = async (req: Request, res: Response) => {
        try{
            const {proposalId} = req.params;
            const {isCustom} = req.body;
            if(isCustom){
                const votes = await customGovernorContract.getCustomProposalVotes(proposalId);
                res.status(200).send({message:"success", status:200, data:votes, error:null});
            }else{
                const standardVotes = await standardGovernorContract.getStandardProposalVotes(proposalId);
                res.status(200).send({message:"success", status:200, data:standardVotes, error:null});
            }
        }
    catch(error){
        res.status(500).send({message:"error", status:500, data:null, error});
    }
}

const getProposalState = async (req: Request, res: Response) => {
        try{
            const {proposalId, isCustom} = req.params;
let proposal;
            if(isCustom){
                proposal = await customGovernorContract.getProposal(proposalId);
            }else{
                proposal = await standardGovernorContract.getProposal(proposalId);
            }
            
            const stateName=proposalStates[proposal.state];

            res.status(200).send({message:"success", status:200, data:`The proposal (${proposalId}) is in ${stateName}`, error:null});
        }
    catch(error){
        res.status(500).send({message:"error", status:500, data:null, error});
    }
}

const getProposalDetails = async (req: Request, res: Response) => {
    try{
        const {proposalId, isCustom} = req.params;

        const retrievalContract:Contract = isCustom ? customGovernorContract : standardGovernorContract;

        const proposalDetails = await retrievalContract.getProposal(proposalId);

        res.status(200).send({message:"success", status:200, data:proposalDetails, error:null});
    }catch(err){
        res.status(500).send({message:"error", status:500, data:null, error:err});
    }
}


const getEmbededProposalDetails = async (req: Request, res: Response) => {
    const {proposalId, isCustom} = req.params;

    const redisStoredProposal = await redisClient.get(`dao_proposals:${proposalId}:data`);
  
        try{
            if(!redisStoredProposal){
               const {data, error}=await supabaseConfig.from('dao_proposals').select('*, dao_members:dao_members(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*), dao_voting_comments:dao_voting_comments(*, dao_members:dao_members(*), dao_proposals:dao_proposals(*))').eq('proposal_id', proposalId).maybeSingle();
    
       logger.info(`Data: ${data}`);

       logger.error(`Error msg: ${error}`)


    if(!data && error){
        res.status(500).send({ status:500, data:null, error});
        return;
    }

    let retrievalContract:Contract;

    if(isCustom){
        retrievalContract=customGovernorContract;
    }
    retrievalContract = standardGovernorContract;

            const proposalDetails = await retrievalContract.getProposal(proposalId);
            logger.info(proposalDetails, 'proposalDetails');

            // Sets data that will expire within 2 hours
            await redisClient.setEx(`dao_proposals:${proposalId}:data`, 7200, JSON.stringify({sm_data:{
                id:proposalDetails.id,
                description:proposalDetails.description,
                proposer:proposalDetails.proposer,
                state:Number(proposalDetails.state),
                startBlockNumber:Number(proposalDetails.startBlockNumber),
                endBlockNumber:Number(proposalDetails.endBlockNumber),
            },db_data:data}));

            res.status(200).send({status:200, data:{sm_data:{
                id:proposalDetails.id,
                description:proposalDetails.description,
                proposer:proposalDetails.proposer,
                state:Number(proposalDetails.state),
                startBlockNumber:Number(proposalDetails.startBlockNumber),
                endBlockNumber:Number(proposalDetails.endBlockNumber),
            },db_data:data}, error:null});
            return;
            }

                console.log(JSON.parse(redisStoredProposal));

                res.status(200).send({message:"success", status:200, data:JSON.parse(redisStoredProposal), error:null});
            
    }catch(err){
        res.status(500).send({message:"error", status:500, data:null, error:err});
    }
}

const createProposalEligible = async(req:Request, res:Response) =>{
        const {memberDiscordId} = req.params;

        const daoMember = await  redisClient.hGetAll(`proposalCreationLimiter:${memberDiscordId}`);

        console.log(daoMember);

        if(!daoMember){
            res.status(404).send({message:"error", status:404, data:null, error:"The user with provided nickname was not found"});
            return;
        }

        res.status(200).send({message:"Success ! You are eligible to create a proposal.", status:200, data:daoMember, error:null});
}


export {
    getProposalVotes,
    getProposalState,
    getProposalDetails,
    getEmbededProposalDetails,
    createProposalEligible
}