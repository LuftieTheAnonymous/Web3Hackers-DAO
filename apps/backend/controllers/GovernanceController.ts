import { Request, Response } from "express";

import dotenv from "dotenv";
import { daoContract, proposalStates, provider } from "../config/ethersConfig";
import { supabaseConfig } from "../config/supabase";
import { ethers, EventLog } from "ethers";
import pLimit from 'p-limit';
import retry from 'async-retry';

export interface ProposalEventArgs extends Omit<EventLog, 'args'> {
    args: string[]
}

dotenv.config();



const activateProposals = async (req: Request, res: Response) => {
  try {
    const { data } = await supabaseConfig.from('dao_proposals').select('*');

    if (!data || data.length === 0) {
 res.status(404).json({ data: null, error: "No proposals found", message: "error", status: 404 });
    }

    const limit = pLimit(5); // Run max 5 activations at a time

    const tasks = (data as any[]).map((event) =>{
        return limit(async () => {
      try {
        const proposal = await daoContract.getProposal(event.proposal_id);

        console.log(proposal);

        const deadline = Number(proposal[3]) * 1000 + Number(proposal[17]);


        if (new Date().getTime() >= deadline && Number(proposal.state) === 0) {
          const tx = await daoContract.activateProposal(proposal[0],{
              maxPriorityFeePerGas: ethers.parseUnits("2", "gwei"),
  maxFeePerGas: ethers.parseUnits("50", "gwei"),
          });
          const receipt = await tx.wait();
          return { success: true, proposalId: proposal[0], receipt };
        } 
      } catch (err) {
        console.error(`Error activating proposal ${event.proposal_id}:`, err);
        return { success: false, proposalId: event.proposal_id, error: err };
      }
    })
    });

    const results = await Promise.allSettled(tasks);

    const summary = results.map((result) =>
      result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    );

     res.status(200).json({ message: "Done", data: summary, status: 200 });
  } catch (error) {
    console.error(error);
     res.status(500).json({ message: "Internal error", error, status: 500 });
  }
};

const finishProposals= async (req: Request, res: Response) => {
    try{
        
     const lastBlock = await provider.getBlockNumber();
     const filters = daoContract.filters.ProposalActivated();

     const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);

 const receipts =    events.map(async (event) => {
      return  await retry(async ()=>{
            return Promise.resolve(async()=>{
           const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]);
        console.log(proposal);
        if(proposal[6] === 1 && new Date(Number(proposal[4]) * 1000).getTime() <= new Date().getTime()){
            const tx = await daoContract.finishProposal((event as ProposalEventArgs).args[0]);
            console.log(tx);
    
            const txReceipt = await tx.wait();
return txReceipt
        }
     })
        },{
            retries: 5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err, attempt) {
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
        })
        


   
    });

    const receiptsResults = await Promise.all(receipts);

    console.log(receiptsResults);
    if(!receiptsResults || receiptsResults.length === 0){
         res.status(404).json({data:null, error:"No proposals to finish", message:"error", status:404});
    }
    
    res.status(200).json({data:receiptsResults, error:null, message:"success", status:200});

    }
     catch(err){
        console.log(err);
        res.status(500).json({data:null, error:err, message:"success", status:200});
     }
    }

const queueProposals = async (req: Request, res: Response) => {
try{
 const lastBlock = await provider.getBlockNumber();
     const filters = daoContract.filters.ProposalSucceeded();

     const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);

 const receipts =    events.map(async (event) => {
    return  await retry(async ()=>{
return  Promise.resolve(async()=>{
            const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]);
        console.log(proposal);
        if(proposal[6] === 4){
            const tx = await daoContract.queueProposal((event as ProposalEventArgs).args[0]);
            console.log(tx);
    
            const txReceipt = await tx.wait();
    return txReceipt
          
        }
})
    }, {
            retries: 5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err, attempt) {
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
    });
    });

    const receiptsResults = await Promise.all(receipts);
    console.log(receiptsResults);

    if(!receiptsResults || receiptsResults.length === 0){
         res.status(404).json({data:null, error:"No proposals to queue", message:"error", status:404});
    }

    res.status(200).json({data:receipts, error:null, message:"success", status:200});
    }
     catch(err){
        console.log(err);
        res.status(500).json({data:null, error:err, message:"error", status:500});
     }
    }

const cancelProposal = async (req: Request, res: Response) => {
    const {proposalId} = req.params;
        try{

            
                const tx = await daoContract.cancelProposal(proposalId);
    
                console.log(tx);
    
                const txReceipt = await tx.wait();
    
                res.status(200).send({message:"success", status:200, data:txReceipt, error:null});
        }
    catch(error){
        res.status(500).send({message:"error", status:500, data:null, error});
    }
}

const executeProposals = async (req: Request, res: Response) => {
        try{

             const lastBlock = await provider.getBlockNumber();
     const filters = daoContract.filters.ProposalQueued(); 
 
 const events = await daoContract.queryFilter(filters, lastBlock - 499, lastBlock);

 console.log(events);


const receipts =events.map(async (event) => {
     return  await retry(async ()=>{
              return Promise.resolve((async()=>{
  const proposal = await daoContract.getProposal((event as ProposalEventArgs).args[0]); 
                if(proposal[6] === 5){
                    const tx = await daoContract.executeProposal((event as ProposalEventArgs).args[0]);
                    console.log(tx);
            
                    const txReceipt = await tx.wait();
                    console.log(txReceipt);
            
                }
              }))
            }, {
            retries: 5,
            maxTimeout: 1 * 1000 * 3600, // 1 hour
            onRetry(err, attempt) {
                console.log(`Retrying... Attempt ${attempt} due to error: ${err}`);
            }
            });
        });

        const receiptsResults = await Promise.all(receipts);
        console.log(receiptsResults);

        if(!receiptsResults || receiptsResults.length === 0){
             res.status(404).json({data:null, error:"No proposals to execute", message:"error", status:404});
        }

            res.status(200).send({message:"success", status:200, data:receipts, error:null});
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

const getProposalQuorum = async (req: Request, res: Response) => {
        try{
            const {proposalId} = req.params;
            const quorum = await daoContract.getProposalQuorumNeeded(proposalId);
            res.status(200).send({message:"success", status:200, data:quorum, error:null});
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

export {
    activateProposals,
    queueProposals,
    cancelProposal,
    finishProposals,
    executeProposals,
    getProposalVotes,
    getProposalState,
    getProposalDetails,
    getProposalQuorum
}