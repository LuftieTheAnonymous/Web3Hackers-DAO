import { Request, Response } from "express";

import dotenv from "dotenv";
import { daoContract, proposalStates } from "../config/ethersConfig.js";

import { EventLog } from "ethers";
import { supabaseConfig } from "../config/supabase.js";
import redisClient from "../redis/set-up.js";
;

export interface ProposalEventArgs extends Omit<EventLog, 'args'> {
    args: string[]
}

dotenv.config();


const cancelProposal = async (req: Request, res: Response) => {
    const {proposalId} = req.params;
        try{
                const tx = await daoContract.cancelProposal(proposalId);
    
                console.log(tx);
    
                const txReceipt = await tx.wait();

                console.log(txReceipt);
    
                res.status(200).send({message:"success", status:200, data:txReceipt, error:null});
        }
    catch(error){
        res.status(500).send({message:"error", status:500, data:null, error});
    }
}



const getProposalVotes = async (req: Request, res: Response) => {
        try{
            const {proposalId} = req.params;
            const {isCustom} = req.body;
            if(isCustom){
                const votes = await daoContract.getCustomProposalVotes(proposalId);
                res.status(200).send({message:"success", status:200, data:votes, error:null});
            }else{
                const standardVotes = await daoContract.getStandardProposalVotes(proposalId);
                res.status(200).send({message:"success", status:200, data:standardVotes, error:null});
            }
        }
    catch(error){
        res.status(500).send({message:"error", status:500, data:null, error});
    }
}

const getProposalState = async (req: Request, res: Response) => {
        try{
            const {proposalId} = req.params;
            const proposal = await daoContract.getProposal(proposalId);
            
            const stateName=proposalStates[proposal.state];

            res.status(200).send({message:"success", status:200, data:`The proposal (${proposalId}) is ${stateName}`, error:null});
        }
    catch(error){
        res.status(500).send({message:"error", status:500, data:null, error});
    }
}

const getProposalDetails = async (req: Request, res: Response) => {
    try{
        const {proposalId} = req.params;
        const proposalDetails = await daoContract.getProposal(proposalId);
        console.log(proposalDetails);
        res.status(200).send({message:"success", status:200, data:proposalDetails, error:null});
    }catch(err){
        res.status(500).send({message:"error", status:500, data:null, error:err});
    }
}


const getEmbededProposalDetails = async (req: Request, res: Response) => {
    const {proposalId} = req.params;

    const redisStoredProposal = await redisClient.get(`dao_proposals:${proposalId}:data`);
    console.log(redisStoredProposal, 'redisStoredProposal');

        try{
            if(!redisStoredProposal){
                const {data, error}= await supabaseConfig.from('dao_proposals').select('*, dao_members!inner(*), dao_vote_options:dao_vote_options(*), calldata_objects:calldata_objects(*)').eq('proposal_id', Number(req.params.proposalId)).single();
    
                console.log(data, error);

    if(!data || error){
        res.status(500).send({message:"error", status:500, data:null, error});
        return;
    }
    
    console.log(data);

            const proposalDetails = await daoContract.getProposal(proposalId);
            console.log(proposalDetails, 'proposalDetails');

            await redisClient.setEx(`dao_proposals:${proposalId}:data`, 7200, JSON.stringify({sm_data:proposalDetails,db_data:data}));

            res.status(200).send({message:"success", status:200, data:{sm_data:proposalDetails,db_data:data}, error:null});

            return;
            }


            res.status(200).send({message:"success", status:200, data:JSON.parse(redisStoredProposal), error:null});
    }catch(err){
        res.status(500).send({message:"error", status:500, data:null, error:err});
    }
}



export {
    cancelProposal,
    getProposalVotes,
    getProposalState,
    getProposalDetails,
    getEmbededProposalDetails
}